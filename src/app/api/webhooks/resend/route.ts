import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import { Webhook } from "svix";

/**
 * Webhook Resend - Suivi des événements d'emails
 *
 * Événements supportés:
 * - email.sent: Email envoyé avec succès
 * - email.delivered: Email livré au destinataire
 * - email.delivery_delayed: Livraison retardée
 * - email.bounced: Email rejeté (hard ou soft bounce)
 * - email.complained: Marqué comme spam par le destinataire
 * - email.opened: Email ouvert par le destinataire
 * - email.clicked: Lien cliqué dans l'email
 *
 * Configuration requise dans Resend Dashboard:
 * - Webhook URL: https://votredomaine.com/api/webhooks/resend
 * - Événements: Tous ceux listés ci-dessus
 * - Secret: Configurer RESEND_WEBHOOK_SECRET dans .env
 */

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Événements spécifiques
    bounce_type?: 'hard' | 'soft';
    click?: {
      link: string;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
    };
    open?: {
      timestamp: string;
      ipAddress: string;
      userAgent: string;
    };
  };
}

/**
 * Vérifier la signature du webhook avec Svix (utilisé par Resend)
 */
async function verifyWebhookSignature(
  payload: string,
  headersList: Headers
): Promise<{ isValid: boolean; event?: ResendWebhookEvent }> {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  // Si aucun secret configuré, accepter le webhook (dev mode)
  if (!webhookSecret) {
    console.warn("⚠️ RESEND_WEBHOOK_SECRET non configuré - webhook accepté sans vérification");
    try {
      return { isValid: true, event: JSON.parse(payload) };
    } catch (e) {
      return { isValid: false };
    }
  }

  // Récupérer les headers Svix (utilisés par Resend)
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("❌ Headers Svix manquants dans le webhook", {
      svixId: !!svixId,
      svixTimestamp: !!svixTimestamp,
      svixSignature: !!svixSignature,
    });
    return { isValid: false };
  }

  try {
    // Créer l'instance Svix Webhook
    const wh = new Webhook(webhookSecret);

    // Vérifier la signature avec le payload brut (string)
    const event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookEvent;

    console.log("✅ Signature webhook Resend vérifiée avec succès");
    return { isValid: true, event };
  } catch (err: any) {
    console.error("❌ Erreur vérification signature webhook:", err.message);
    return { isValid: false };
  }
}

/**
 * Mapper les événements Resend vers les statuts email_logs
 * Note: La table email_logs a une contrainte CHECK qui n'autorise que:
 * 'pending', 'sent', 'failed', 'bounced', 'complained', 'queued', 'delayed'
 * Les autres événements (delivered, opened, clicked) sont stockés dans metadata
 */
function mapEventToStatus(eventType: string): string {
  const mapping: Record<string, string> = {
    "email.sent": "sent",
    "email.delivered": "sent", // Garder 'sent', l'événement sera dans metadata
    "email.delivery_delayed": "delayed",
    "email.bounced": "bounced",
    "email.complained": "complained",
    "email.opened": "sent", // Garder 'sent', l'événement sera dans metadata
    "email.clicked": "sent", // Garder 'sent', l'événement sera dans metadata
  };

  return mapping[eventType] || "sent";
}

export async function POST(request: NextRequest) {
  try {
    // IMPORTANT: Récupérer le raw body (string) pour la vérification de signature
    // La signature cryptographique est sensible au moindre changement
    const payload = await request.text();

    // Récupérer les headers
    const headersList = await headers();

    // Vérifier la signature du webhook avec Svix
    const { isValid, event } = await verifyWebhookSignature(payload, headersList);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    console.log(`📧 Webhook Resend reçu: ${event.type} pour email ${event.data.email_id}`);

    // Trouver l'email dans email_logs par resend_id
    // Utiliser getAdminClient() pour bypasser les RLS (webhook n'est pas authentifié)
    const supabase = getAdminClient();
    const { data: existingLogs, error: fetchError } = await supabase
      .from("email_logs")
      .select("*")
      .eq("resend_id", event.data.email_id);

    if (fetchError) {
      console.error("Erreur lors de la recherche de l'email:", fetchError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (!existingLogs || existingLogs.length === 0) {
      console.warn(`⚠️ Email non trouvé dans email_logs: ${event.data.email_id}`);
      // Ne pas retourner d'erreur pour ne pas bloquer Resend
      return NextResponse.json({ success: true, message: "Email not found but acknowledged" });
    }

    // Mettre à jour le statut et les métadonnées
    const newStatus = mapEventToStatus(event.type);
    const metadata: any = {
      last_event: event.type,
      last_event_at: event.created_at,
    };

    // Ajouter les données spécifiques selon le type d'événement
    if (event.data.bounce_type) {
      metadata.bounce_type = event.data.bounce_type;
    }

    if (event.data.click) {
      metadata.clicks = [...(existingLogs[0].metadata?.clicks || []), event.data.click];
    }

    if (event.data.open) {
      metadata.opens = [...(existingLogs[0].metadata?.opens || []), event.data.open];
    }

    // Mettre à jour tous les logs correspondants (peut y avoir plusieurs destinataires)
    for (const log of existingLogs) {
      const { error: updateError } = await supabase
        .from("email_logs")
        .update({
          delivery_status: newStatus, // ✅ Mise à jour du bon champ
          metadata: {
            ...log.metadata,
            ...metadata,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", log.id);

      if (updateError) {
        console.error(`Erreur mise à jour email log ${log.id}:`, updateError);
      } else {
        console.log(`✅ Email log ${log.id} mis à jour: ${newStatus}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Webhook processed for ${existingLogs.length} email(s)`,
      event_type: event.type,
      email_id: event.data.email_id,
    });

  } catch (error) {
    console.error("Erreur traitement webhook Resend:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * GET pour vérifier que le webhook est actif
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Resend webhook endpoint is active",
    supported_events: [
      "email.sent",
      "email.delivered",
      "email.delivery_delayed",
      "email.bounced",
      "email.complained",
      "email.opened",
      "email.clicked",
    ],
  });
}

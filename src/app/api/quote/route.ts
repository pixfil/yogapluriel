import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { validateRecaptchaToken } from "@/lib/recaptcha";
import { quoteLimiter, getClientIP, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from 'zod';
import { sendEmailWithTemplate } from "@/lib/resend";
import { getEmailSettings } from "@/app/actions/settings";
import QuoteConfirmationEmail from "@/emails/quote-confirmation";
import QuoteNotificationEmail from "@/emails/quote-notification";
import { analyzeMessage, isSpamFilterEnabled } from "@/lib/spam-detection";

// ✅ Schéma de validation Zod inline (structure simplifiée)
const quoteSchema = z.object({
  nom: z.string().min(2).max(100),
  email: z.string().email().max(255),
  telephone: z.string().min(10, 'Téléphone requis'), // Validation basique seulement
  message: z.string().min(10, 'Message doit contenir au moins 10 caractères').max(2000),
  isUrgent: z.boolean().optional(),
  recaptchaToken: z.string().nullish(), // Accepte null, undefined, ou string
  // Tracking source (optionnel)
  sourceUrl: z.string().max(500).optional(),
  sourceFormType: z.string().max(100).optional(),
  referrer: z.string().optional(),
}).transform((data) => ({
  ...data,
  telephone: data.telephone.replace(/[\s\-\.]/g, ''), // Nettoyer après validation
}));

export async function POST(request: NextRequest) {
  try {
    // ✅ ÉTAPE 1: Rate Limiting (protection spam)
    const ip = getClientIP(request);

    if (quoteLimiter) {
      const { success, reset } = await quoteLimiter.limit(ip);

      if (!success) {
        return createRateLimitResponse(
          reset,
          "Trop de demandes de devis. Vous pouvez soumettre maximum 5 demandes par heure."
        );
      }
    }

    // ✅ ÉTAPE 2: Validation Zod (anti-injection SQL/XSS)
    const body = await request.json();
    const validationResult = quoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { nom, email, telephone, message, isUrgent, recaptchaToken, sourceUrl, sourceFormType, referrer } = validationResult.data;

    // Validation reCAPTCHA
    const recaptchaResult = await validateRecaptchaToken(
      recaptchaToken,
      "quote_form"
    );

    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, error: recaptchaResult.error || "Validation reCAPTCHA échouée" },
        { status: 400 }
      );
    }

    // ✅ Analyse anti-spam
    let spamAnalysis = {
      isSpam: false,
      score: 0,
      reason: '',
    };

    const spamFilterEnabled = await isSpamFilterEnabled();
    if (spamFilterEnabled) {
      spamAnalysis = await analyzeMessage({
        name: nom,
        email,
        message,
        phone: telephone,
      });

      console.log(`[SPAM CHECK] Quote form - Email: ${email}, Is Spam: ${spamAnalysis.isSpam}, Score: ${spamAnalysis.score}, Reason: ${spamAnalysis.reason}`);
    }

    // Insérer dans la table quote_requests
    const supabase = await createClient();
    const { error } = await supabase
      .from("quote_requests")
      .insert({
        name: nom,
        email,
        phone: telephone,
        service_type: isUrgent ? "Intervention urgente" : "Demande de devis",
        project_description: message,
        urgency: isUrgent ? "urgent" : "normal",
        status: "new",
        source: isUrgent ? "website_urgent_form" : "website_quote_form",
        ip_address: request.ip || request.headers.get("x-forwarded-for"),
        user_agent: request.headers.get("user-agent"),
        // Tracking source
        source_url: sourceUrl || null,
        source_form_type: sourceFormType || null,
        referrer: referrer || request.headers.get("referer") || null,
        // Spam detection
        is_spam: spamAnalysis.isSpam,
        spam_reason: spamAnalysis.reason || null,
        spam_score: spamAnalysis.score,
      });

    // Pas de .select() pour les formulaires publics (RLS bloquerait le SELECT pour anon)

    if (error) {
      console.error("Erreur insertion quote:", error);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'enregistrement" },
        { status: 500 }
      );
    }

    // ✅ ÉTAPE 3: Envoyer les emails
    try {
      // Récupérer les settings emails (test mode)
      const emailSettings = await getEmailSettings();

      // 1. Email de confirmation au client
      const confirmationSubject = isUrgent
        ? "Demande urgente bien reçue - FormDeToit"
        : "Demande de contact bien reçue - FormDeToit";

      const confirmationResult = await sendEmailWithTemplate({
        to: email,
        subject: confirmationSubject,
        template: QuoteConfirmationEmail({
          nom,
          telephone,
          email,
          message,
          isUrgent: isUrgent || false,
        }),
        testModeEnabled: emailSettings.test_mode_enabled,
        testRecipient: emailSettings.test_mode_recipient,
      });

      // Logger l'email de confirmation
      if (confirmationResult.success) {
        await supabase.from("email_logs").insert({
          to_email: email,
          from_email: "contact@mail.formdetoit.fr",
          subject: confirmationSubject,
          status: "sent",
          resend_id: confirmationResult.resendId,
          metadata: {
            template_name: "quote_confirmation",
            source: isUrgent ? "urgent_quote_form" : "quote_form",
            is_urgent: isUrgent || false,
          },
        });
      } else {
        console.error("Erreur envoi email confirmation:", confirmationResult.error);
      }

      // 2. Email de notification aux admins (SEULEMENT si non-spam)
      if (!spamAnalysis.isSpam) {
        const adminEmails = emailSettings.notification_emails;

        const notificationSubject = isUrgent
          ? "URGENT - Nouvelle demande d'intervention - FormDeToit"
          : "Nouvelle demande de contact - FormDeToit";

        const notificationResult = await sendEmailWithTemplate({
          to: adminEmails,
          subject: notificationSubject,
          template: QuoteNotificationEmail({
            nom,
            telephone,
            email,
            message,
            isUrgent: isUrgent || false,
            source: isUrgent ? "website_urgent_form" : "website_quote_form",
            ipAddress: request.ip || request.headers.get("x-forwarded-for"),
            createdAt: new Date().toISOString(),
            // Tracking source
            sourceUrl: sourceUrl || undefined,
            sourceFormType: sourceFormType || undefined,
            referrer: referrer || request.headers.get("referer") || undefined,
          }),
          testModeEnabled: emailSettings.test_mode_enabled,
          testRecipient: emailSettings.test_mode_recipient,
        });

        // Logger l'email de notification
        if (notificationResult.success) {
          // Créer un log pour chaque destinataire admin
          for (const adminEmail of adminEmails) {
            await supabase.from("email_logs").insert({
              to_email: adminEmail,
              from_email: "contact@mail.formdetoit.fr",
              subject: notificationSubject,
              status: "sent",
              resend_id: notificationResult.resendId,
              metadata: {
                template_name: "quote_notification",
                source: isUrgent ? "urgent_quote_form" : "quote_form",
                is_urgent: isUrgent || false,
                is_admin_notification: true,
              },
            });
          }
        } else {
          console.error("Erreur envoi email notification:", notificationResult.error);
        }
      } else {
        console.log(`[SPAM] Email admin non envoyé - Devis marqué comme spam (${spamAnalysis.reason})`);
      }
    } catch (emailError) {
      // Ne pas bloquer la réponse si les emails échouent
      console.error("Erreur lors de l'envoi des emails:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Demande enregistrée avec succès",
    });
  } catch (error) {
    console.error("Erreur API quote:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

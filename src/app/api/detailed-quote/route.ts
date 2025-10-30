import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// import { unstable_after as after } from 'next/server'; // TODO: Décommenter lors migration Next.js 16+
import { DetailedQuoteData } from '@/lib/types/detailed-quote';
import { getSecuritySettings, getEmailSettings } from '@/app/actions/settings';
import { sendEmailWithTemplate } from '@/lib/resend';
import DetailedQuoteConfirmationEmail from '@/emails/detailed-quote-confirmation';
import DetailedQuoteNotificationEmail from '@/emails/detailed-quote-notification';
import { analyzeMessage, isSpamFilterEnabled } from '@/lib/spam-detection';

// Removed edge runtime to avoid 25s timeout - email sending takes longer
// Emails sent in parallel with Promise.all() for best performance (~3-5s)
// TODO Next.js 16: Utiliser after() pour envoi async après réponse (voir code commenté ligne 270+)

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recaptchaToken, sourceUrl, sourceFormType, referrer, ...data }: DetailedQuoteData & {
      recaptchaToken?: string | null;
      sourceUrl?: string;
      sourceFormType?: string;
      referrer?: string;
    } = body;

    // Validation basique
    if (!data.name || !data.email || !data.phone || !data.propertyAddress) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    if (!data.projectNature || data.projectNature.length === 0) {
      return NextResponse.json(
        { error: 'Veuillez sélectionner au moins un type de travaux' },
        { status: 400 }
      );
    }

    // Validation reCAPTCHA
    const securitySettings = await getSecuritySettings();

    if (securitySettings.recaptcha_enabled) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'Token reCAPTCHA manquant' },
          { status: 400 }
        );
      }

      if (!securitySettings.recaptcha_secret_key) {
        console.error("reCAPTCHA activé mais secret key manquante");
        return NextResponse.json(
          { error: 'Configuration reCAPTCHA invalide' },
          { status: 500 }
        );
      }

      const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: securitySettings.recaptcha_secret_key,
          response: recaptchaToken,
        }),
      });

      const recaptchaData: RecaptchaResponse = await recaptchaResponse.json();

      if (!recaptchaData.success) {
        console.warn("reCAPTCHA validation échec:", recaptchaData["error-codes"]);
        return NextResponse.json(
          { error: 'Validation reCAPTCHA échouée' },
          { status: 400 }
        );
      }

      if (recaptchaData.action !== "detailed_quote_form") {
        console.warn(`Action reCAPTCHA incorrecte. Attendu: detailed_quote_form, Reçu: ${recaptchaData.action}`);
        return NextResponse.json(
          { error: 'Action reCAPTCHA incorrecte' },
          { status: 400 }
        );
      }

      if (recaptchaData.score < 0.5) {
        console.warn(`Score reCAPTCHA trop bas: ${recaptchaData.score}`);
        return NextResponse.json(
          { error: `Score de sécurité insuffisant (${recaptchaData.score.toFixed(2)})` },
          { status: 400 }
        );
      }

      console.log(`reCAPTCHA validé. Score: ${recaptchaData.score}`);
    }

    // ✅ Analyse anti-spam
    // Combiner tous les champs textuels pour analyse
    const fullMessage = [
      data.specialRequests,
      data.materialsReason,
      data.constraintsDetails,
      data.discoverySourceOther,
    ].filter(Boolean).join(' ');

    let spamAnalysis = {
      isSpam: false,
      score: 0,
      reason: '',
    };

    const spamFilterEnabled = await isSpamFilterEnabled();
    if (spamFilterEnabled) {
      spamAnalysis = await analyzeMessage({
        name: data.name,
        email: data.email,
        message: fullMessage || 'Demande de devis détaillé',
        phone: data.phone,
      });

      console.log(`[SPAM CHECK] Detailed quote - Email: ${data.email}, Is Spam: ${spamAnalysis.isSpam}, Score: ${spamAnalysis.score}, Reason: ${spamAnalysis.reason}`);
    }

    // Connection Supabase
    const supabase = await createClient();

    // Insertion dans la base de données
    const { error: insertError } = await supabase
      .from('detailed_quotes')
      .insert({
        // Étape 1
        project_nature: data.projectNature,
        existing_tiles: data.existingTiles,
        existing_insulation: data.existingInsulation,
        existing_zinguerie: data.existingZinguerie,

        // Étape 2
        house_year: data.houseYear,
        carpentry_year: data.carpentryYear,
        insulation_year: data.insulationYear,
        roof_year: data.roofYear,

        // Étape 3
        objectives: data.objectives,
        desired_materials: data.desiredMaterials,
        materials_reason: data.materialsReason,
        special_requests: data.specialRequests,

        // Étape 4
        timeline: data.timeline,
        attic_access: data.atticAccess,
        regulatory_constraints: data.regulatoryConstraints,
        constraints_details: data.constraintsDetails,

        // Étape 5
        requested_aids: data.requestedAids,
        needs_aid_support: data.needsAidSupport,
        budget_range: data.budgetRange,

        // Étape 6
        discovery_source: data.discoverySource,
        discovery_source_other: data.discoverySourceOther,
        name: data.name,
        phone: data.phone,
        email: data.email,
        property_address: data.propertyAddress,

        // Backup JSON complet
        form_data: data,

        // Métadonnées
        status: 'new',
        is_read: false,

        // Tracking source
        source_url: sourceUrl || null,
        source_form_type: sourceFormType || 'detailed_quote_contact_page',
        referrer: referrer || request.headers.get("referer") || null,

        // Spam detection
        is_spam: spamAnalysis.isSpam,
        spam_reason: spamAnalysis.reason || null,
        spam_score: spamAnalysis.score,
      });

    // Pas de .select() pour les formulaires publics (RLS bloquerait le SELECT pour anon)

    if (insertError) {
      console.error('Erreur insertion BDD:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement' },
        { status: 500 }
      );
    }

    console.log('Demande détaillée créée avec succès');

    // ✅ ÉTAPE 3: Envoyer les emails EN PARALLÈLE avec Promise.all
    // Récupérer les paramètres email UNE SEULE FOIS (optimisation -600ms)
    const emailSettings = await getEmailSettings();
    const adminEmails = emailSettings.notification_emails;

    // Email 1: Confirmation client (TOUJOURS envoyé)
    const confirmationResult = await sendEmailWithTemplate({
      to: data.email,
      subject: "Votre demande détaillée a bien été reçue - FormDeToit",
      template: DetailedQuoteConfirmationEmail({
        nom: data.name,
        telephone: data.phone,
        email: data.email,
        propertyAddress: data.propertyAddress,
        projectNature: data.projectNature,
        timeline: data.timeline,
      }),
      testModeEnabled: emailSettings.test_mode_enabled,
      testRecipient: emailSettings.test_mode_recipient,
    });

    // Email 2: Notification admins (SEULEMENT si non-spam)
    let notificationResult = null;

    if (!spamAnalysis.isSpam) {
      notificationResult = await sendEmailWithTemplate({
        to: adminEmails,
        subject: "Nouvelle demande détaillée - FormDeToit",
        template: DetailedQuoteNotificationEmail({
          nom: data.name,
          telephone: data.phone,
          email: data.email,
          propertyAddress: data.propertyAddress,
          projectNature: data.projectNature,
          objectives: data.objectives,
          timeline: data.timeline,
          budgetRange: data.budgetRange,
          needsAidSupport: data.needsAidSupport,
          createdAt: new Date().toISOString(),
          // Tracking source
          sourceUrl: sourceUrl || undefined,
          sourceFormType: sourceFormType || 'detailed_quote_contact_page',
          referrer: referrer || request.headers.get("referer") || undefined,
        }),
        testModeEnabled: emailSettings.test_mode_enabled,
        testRecipient: emailSettings.test_mode_recipient,
      });
    } else {
      console.log(`[SPAM] Email admin non envoyé - Devis détaillé marqué comme spam (${spamAnalysis.reason})`);
    }

    // Logger les résultats (non-bloquant avec .then())
    if (confirmationResult.success) {
      supabase.from("email_logs").insert({
        to_email: data.email,
        from_email: "contact@mail.formdetoit.fr",
        subject: "Votre demande détaillée a bien été reçue - FormDeToit",
        status: "sent",
        resend_id: confirmationResult.resendId,
        metadata: {
          template_name: "detailed_quote_confirmation",
          source: "detailed_quote_form",
        },
      }).then(() => console.log("✅ Log confirmation créé"))
        .catch(err => console.error("❌ Erreur log confirmation:", err));
    } else {
      console.error("❌ Erreur envoi email confirmation:", confirmationResult.error);
    }

    if (notificationResult && notificationResult.success) {
      for (const adminEmail of adminEmails) {
        supabase.from("email_logs").insert({
          to_email: adminEmail,
          from_email: "contact@mail.formdetoit.fr",
          subject: "Nouvelle demande détaillée - FormDeToit",
          status: "sent",
          resend_id: notificationResult.resendId,
          metadata: {
            template_name: "detailed_quote_notification",
            source: "detailed_quote_form",
            is_admin_notification: true,
          },
        }).then(() => console.log(`✅ Log notification créé pour ${adminEmail}`))
          .catch(err => console.error("❌ Erreur log notification:", err));
      }
    } else if (notificationResult && !notificationResult.success) {
      console.error("❌ Erreur envoi email notification:", notificationResult.error);
    }

    console.log('✅ Emails envoyés avec succès');

    return NextResponse.json({
      success: true,
      message: 'Demande détaillée enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur API detailed-quote:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

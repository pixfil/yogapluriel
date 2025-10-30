import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { validateRecaptchaToken } from "@/lib/recaptcha";
import { contactFormSchema } from "@/lib/validations";
import { contactFormLimiter, getClientIP, createRateLimitResponse } from "@/lib/rate-limit";
import { sendEmailWithTemplate } from "@/lib/resend";
import { getEmailSettings } from "@/app/actions/settings";
import ContactConfirmationEmail from "@/emails/contact-confirmation";
import ContactNotificationEmail from "@/emails/contact-notification";
import { analyzeMessage, isSpamFilterEnabled } from "@/lib/spam-detection";

export async function POST(request: NextRequest) {
  try {
    // ✅ ÉTAPE 1: Rate Limiting (protection spam)
    const ip = getClientIP(request);

    if (contactFormLimiter) {
      const { success, reset } = await contactFormLimiter.limit(ip);

      if (!success) {
        return createRateLimitResponse(
          reset,
          "Trop de soumissions. Vous pouvez soumettre maximum 3 formulaires par heure."
        );
      }
    }

    // ✅ ÉTAPE 2: Validation Zod (anti-injection SQL/XSS)
    const body = await request.json();
    const validationResult = contactFormSchema.safeParse(body);

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

    const { nom, email, telephone, message, recaptchaToken, sourceUrl, sourceFormType, referrer } = validationResult.data;

    // Validation reCAPTCHA
    const recaptchaResult = await validateRecaptchaToken(
      recaptchaToken,
      "contact_form"
    );

    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, error: recaptchaResult.error || "Validation reCAPTCHA échouée" },
        { status: 400 }
      );
    }

    // ✅ ÉTAPE 2.5: Analyse anti-spam
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
        phone: telephone || undefined,
      });

      console.log(`[SPAM CHECK] Contact form - Email: ${email}, Is Spam: ${spamAnalysis.isSpam}, Score: ${spamAnalysis.score}, Reason: ${spamAnalysis.reason}`);
    }

    // Insérer dans la table contacts
    const supabase = await createClient();
    const { error } = await supabase
      .from("contacts")
      .insert({
        name: nom,
        email,
        phone: telephone || null,
        subject: "Contact depuis le site web",
        message,
        status: "new",
        priority: "normal",
        source: "website_contact_form",
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
      console.error("Erreur insertion contact:", error);
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
      const confirmationResult = await sendEmailWithTemplate({
        to: email,
        subject: "Votre message a bien été reçu - FormDeToit",
        template: ContactConfirmationEmail({
          nom,
          telephone: telephone || undefined,
          email,
          message,
        }),
        testModeEnabled: emailSettings.test_mode_enabled,
        testRecipient: emailSettings.test_mode_recipient,
      });

      // Logger l'email de confirmation
      if (confirmationResult.success) {
        const { error: logError } = await supabase.from("email_logs").insert({
          to_email: email,
          from_email: "contact@mail.formdetoit.fr",
          subject: "Votre message a bien été reçu - FormDeToit",
          status: "sent",
          resend_id: confirmationResult.resendId,
          metadata: {
            template_name: "contact_confirmation",
            source: "contact_form",
          },
        });
        if (logError) {
          console.error("Erreur insertion email log confirmation:", logError);
        } else {
          console.log("✅ Email log confirmation créé");
        }
      } else {
        console.error("Erreur envoi email confirmation:", confirmationResult.error);
      }

      // 2. Email de notification aux admins (SEULEMENT si non-spam)
      if (!spamAnalysis.isSpam) {
        const adminEmails = emailSettings.notification_emails;

        const notificationResult = await sendEmailWithTemplate({
          to: adminEmails,
          subject: "Nouveau message de contact - FormDeToit",
          template: ContactNotificationEmail({
            nom,
            telephone: telephone || undefined,
            email,
            message,
            source: "website_contact_form",
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
            const { error: logError } = await supabase.from("email_logs").insert({
              to_email: adminEmail,
              from_email: "contact@mail.formdetoit.fr",
              subject: "Nouveau message de contact - FormDeToit",
              status: "sent",
              resend_id: notificationResult.resendId,
              metadata: {
                template_name: "contact_notification",
                source: "contact_form",
                is_admin_notification: true,
              },
            });
            if (logError) {
              console.error(`Erreur insertion email log notification (${adminEmail}):`, logError);
            } else {
              console.log(`✅ Email log notification créé pour ${adminEmail}`);
            }
          }
        } else {
          console.error("Erreur envoi email notification:", notificationResult.error);
        }
      } else {
        console.log(`[SPAM] Email admin non envoyé - Message marqué comme spam (${spamAnalysis.reason})`);
      }
    } catch (emailError) {
      // Ne pas bloquer la réponse si les emails échouent
      console.error("Erreur lors de l'envoi des emails:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Contact enregistré avec succès",
    });
  } catch (error) {
    console.error("Erreur API contact:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

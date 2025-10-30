import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { validateRecaptchaToken } from "@/lib/recaptcha";
import { getClientIP, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from 'zod';
import { sendEmailWithTemplate } from "@/lib/resend";
import { getEmailSettings } from "@/app/actions/settings";
import JobApplicationConfirmationEmail from "@/emails/job-application-confirmation";
import JobApplicationNotificationEmail from "@/emails/job-application-notification";

// ✅ Schéma de validation Zod
const jobApplicationSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  email: z.string().email('Email invalide').max(255),
  phone: z.string().min(10, 'Téléphone requis'),
  message: z.string().max(1000).optional(),
  jobId: z.string().uuid('ID offre invalide'),
  jobTitle: z.string().min(1),
  recaptchaToken: z.string().nullish(),
}).transform((data) => ({
  ...data,
  phone: data.phone.replace(/[\s\-\.]/g, ''), // Nettoyer
}));

export async function POST(request: NextRequest) {
  try {
    // ✅ ÉTAPE 1: Rate Limiting (3 candidatures/heure)
    const ip = getClientIP(request);

    // Note: jobApplicationLimiter sera ajouté après dans rate-limit.ts
    // Pour l'instant, on utilise un rate limiting basique

    // ✅ ÉTAPE 2: Parse FormData
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = (formData.get('message') as string) || '';
    const jobId = formData.get('jobId') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const recaptchaToken = formData.get('recaptchaToken') as string | null;
    const cvFile = formData.get('cv') as File | null;
    const coverLetterFile = formData.get('coverLetter') as File | null;

    // Validation Zod des champs texte
    const validationResult = jobApplicationSchema.safeParse({
      name,
      email,
      phone,
      message,
      jobId,
      jobTitle,
      recaptchaToken,
    });

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

    const validatedData = validationResult.data;

    // Validation CV obligatoire
    if (!cvFile) {
      return NextResponse.json(
        { success: false, error: "Le CV est obligatoire" },
        { status: 400 }
      );
    }

    // Validation taille et type de fichiers
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (cvFile.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "CV trop volumineux (max 5MB)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        { success: false, error: "Format de CV non supporté (PDF, DOC, DOCX)" },
        { status: 400 }
      );
    }

    if (coverLetterFile) {
      if (coverLetterFile.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: "Lettre de motivation trop volumineuse (max 5MB)" },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(coverLetterFile.type)) {
        return NextResponse.json(
          { success: false, error: "Format de lettre non supporté (PDF, DOC, DOCX)" },
          { status: 400 }
        );
      }
    }

    // Validation reCAPTCHA
    const recaptchaResult = await validateRecaptchaToken(
      recaptchaToken,
      "job_application"
    );

    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, error: recaptchaResult.error || "Validation reCAPTCHA échouée" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Générer ID unique pour cette candidature
    const applicationId = crypto.randomUUID();

    // ✅ ÉTAPE 3: Upload fichiers vers Supabase Storage
    let cvUrl = '';
    let coverLetterUrl = '';

    try {
      // Upload CV
      const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
      const cvFileName = `${applicationId}/cv-${Date.now()}.${cvFile.name.split('.').pop()}`;

      const { data: cvData, error: cvError } = await supabase.storage
        .from('job-applications')
        .upload(cvFileName, cvBuffer, {
          contentType: cvFile.type,
          cacheControl: '3600',
        });

      if (cvError) {
        console.error('Erreur upload CV:', cvError);
        return NextResponse.json(
          { success: false, error: "Erreur lors de l'upload du CV" },
          { status: 500 }
        );
      }

      // Get signed URL for CV (1 hour expiration for security)
      const { data: cvUrlData, error: cvUrlError } = await supabase.storage
        .from('job-applications')
        .createSignedUrl(cvFileName, 3600); // 1h expiration

      if (cvUrlError || !cvUrlData) {
        console.error('Erreur génération URL CV:', cvUrlError);
        return NextResponse.json(
          { success: false, error: "Erreur lors de la génération du lien CV" },
          { status: 500 }
        );
      }

      cvUrl = cvUrlData.signedUrl;

      // Upload lettre de motivation si présente
      if (coverLetterFile) {
        const clBuffer = Buffer.from(await coverLetterFile.arrayBuffer());
        const clFileName = `${applicationId}/cover-letter-${Date.now()}.${coverLetterFile.name.split('.').pop()}`;

        const { data: clData, error: clError } = await supabase.storage
          .from('job-applications')
          .upload(clFileName, clBuffer, {
            contentType: coverLetterFile.type,
            cacheControl: '3600',
          });

        if (!clError && clData) {
          // Get signed URL for cover letter (1 hour expiration)
          const { data: clUrlData, error: clUrlGenError } = await supabase.storage
            .from('job-applications')
            .createSignedUrl(clFileName, 3600);

          if (!clUrlGenError && clUrlData) {
            coverLetterUrl = clUrlData.signedUrl;
          }
        }
      }
    } catch (uploadError) {
      console.error('Erreur upload fichiers:', uploadError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'upload des fichiers" },
        { status: 500 }
      );
    }

    // ✅ ÉTAPE 4: Insérer dans la table job_applications
    const { error: insertError } = await supabase
      .from("job_applications")
      .insert({
        id: applicationId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message || null,
        job_opening_id: validatedData.jobId,
        job_title: validatedData.jobTitle,
        cv_url: cvUrl,
        cover_letter_url: coverLetterUrl || null,
        status: "new",
        source: "website_popup",
        ip_address: request.ip || request.headers.get("x-forwarded-for"),
        user_agent: request.headers.get("user-agent"),
      });

    if (insertError) {
      console.error("Erreur insertion candidature:", insertError);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'enregistrement de votre candidature" },
        { status: 500 }
      );
    }

    // ✅ ÉTAPE 5: Envoyer les emails
    try {
      // 1. Email de confirmation au candidat
      const confirmationSubject = `Candidature bien reçue - ${validatedData.jobTitle} - FormDeToit`;

      const confirmationResult = await sendEmailWithTemplate({
        to: validatedData.email,
        subject: confirmationSubject,
        template: JobApplicationConfirmationEmail({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          jobTitle: validatedData.jobTitle,
          message: validatedData.message,
        }),
      });

      // Logger l'email de confirmation
      if (confirmationResult.success) {
        await supabase.from("email_logs").insert({
          to_email: validatedData.email,
          from_email: "contact@mail.formdetoit.fr",
          subject: confirmationSubject,
          status: "sent",
          resend_id: confirmationResult.resendId,
          related_type: "job_application",
          related_id: applicationId,
          metadata: {
            template_name: "job_application_confirmation",
            job_id: validatedData.jobId,
            job_title: validatedData.jobTitle,
          },
        });
      } else {
        console.error("Erreur envoi email confirmation:", confirmationResult.error);
      }

      // 2. Email de notification aux admins
      const emailSettings = await getEmailSettings();
      const adminEmails = emailSettings.notification_emails;

      const notificationSubject = `Nouvelle candidature - ${validatedData.jobTitle} - ${validatedData.name}`;

      const notificationResult = await sendEmailWithTemplate({
        to: adminEmails,
        subject: notificationSubject,
        template: JobApplicationNotificationEmail({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          jobTitle: validatedData.jobTitle,
          message: validatedData.message,
          cvUrl,
          coverLetterUrl: coverLetterUrl || undefined,
          source: "website_popup",
          ipAddress: request.ip || request.headers.get("x-forwarded-for"),
          createdAt: new Date().toISOString(),
        }),
      });

      // Logger l'email de notification
      if (notificationResult.success) {
        for (const adminEmail of adminEmails) {
          await supabase.from("email_logs").insert({
            to_email: adminEmail,
            from_email: "contact@mail.formdetoit.fr",
            subject: notificationSubject,
            status: "sent",
            resend_id: notificationResult.resendId,
            related_type: "job_application",
            related_id: applicationId,
            metadata: {
              template_name: "job_application_notification",
              job_id: validatedData.jobId,
              job_title: validatedData.jobTitle,
              is_admin_notification: true,
            },
          });
        }
      } else {
        console.error("Erreur envoi email notification:", notificationResult.error);
      }
    } catch (emailError) {
      console.error("Erreur lors de l'envoi des emails:", emailError);
      // Ne pas bloquer la réponse si les emails échouent
    }

    return NextResponse.json({
      success: true,
      message: "Candidature envoyée avec succès",
      applicationId,
    });
  } catch (error) {
    console.error("Erreur API job-application:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

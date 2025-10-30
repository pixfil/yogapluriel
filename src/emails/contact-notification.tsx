import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import EmailHeader from './components/EmailHeader';
import EmailFooter from './components/EmailFooter';

interface ContactNotificationEmailProps {
  nom: string;
  telephone?: string;
  email: string;
  message: string;
  source: string;
  ipAddress?: string | null;
  createdAt: string;
  // Tracking source
  sourceUrl?: string;
  sourceFormType?: string;
  referrer?: string;
}

export const ContactNotificationEmail = ({
  nom = 'Jean Dupont',
  telephone,
  email = 'jean.dupont@email.com',
  message = 'Bonjour, je souhaite un devis...',
  source = 'website_contact_form',
  ipAddress,
  createdAt = new Date().toISOString(),
  sourceUrl,
  sourceFormType,
  referrer,
}: ContactNotificationEmailProps) => {
  const formattedDate = new Date(createdAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>Nouvelle demande de contact - FormDeToit</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader isAdmin />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Nouvelle demande de contact</Heading>

            <Text style={alert}>
              Une nouvelle demande de contact a été reçue.
            </Text>

            {/* Client Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>Informations client :</Text>
              <Text style={infoLine}>
                <strong>Nom :</strong> {nom}
              </Text>
              <Text style={infoLine}>
                <strong>Email :</strong> <a href={`mailto:${email}`} style={emailLink}>{email}</a>
              </Text>
              {telephone && (
                <Text style={infoLine}>
                  <strong>Téléphone :</strong> <a href={`tel:${telephone}`} style={phoneLink}>{telephone}</a>
                </Text>
              )}
              <Text style={infoLine}>
                <strong>Reçu le :</strong> {formattedDate}
              </Text>
            </Section>

            {/* Message */}
            <Section style={messageBox}>
              <Text style={messageTitle}>Message :</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

            {/* Metadata */}
            <Section style={metaBox}>
              <Text style={metaText}>
                <strong>Source :</strong> {source}<br />
                {ipAddress && <><strong>IP :</strong> {ipAddress}</>}
              </Text>
            </Section>

            {/* Source Tracking */}
            {(sourceUrl || sourceFormType || referrer) && (
              <Section style={trackingBox}>
                <Text style={infoTitle}>📍 Provenance de la demande</Text>
                {sourceUrl && (
                  <Text style={trackingLine}>
                    <strong>Page :</strong> {sourceUrl}
                  </Text>
                )}
                {sourceFormType && (
                  <Text style={trackingLine}>
                    <strong>Type de formulaire :</strong> {sourceFormType}
                  </Text>
                )}
                {referrer && (
                  <Text style={trackingLine}>
                    <strong>Provenance externe :</strong> {referrer}
                  </Text>
                )}
              </Section>
            )}

            <Hr style={hr} />

            <Text style={paragraph}>
              Pour répondre, rendez-vous dans l'interface admin : <br />
              <a href="https://formdetoit-website.vercel.app/admin/inbox" style={link}>
                Accéder à la boîte de réception
              </a>
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default ContactNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
};

const content = {
  padding: '30px',
};

const title = {
  color: '#000000',
  fontSize: '22px',
  fontWeight: 'bold',
  marginBottom: '16px',
};

const alert = {
  color: '#DC2626',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const paragraph = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const infoTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoLine = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '6px 0',
};

const messageBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #F59E0B',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const messageTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const messageText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const metaBox = {
  backgroundColor: '#F3F4F6',
  padding: '12px',
  borderRadius: '4px',
  margin: '16px 0',
};

const metaText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const link = {
  color: '#F59E0B',
  textDecoration: 'none',
  fontWeight: '600',
};

const emailLink = {
  color: '#2563EB',
  textDecoration: 'none',
};

const phoneLink = {
  color: '#059669',
  textDecoration: 'none',
};

const trackingBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const trackingLine = {
  color: '#374151',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '6px 0',
};

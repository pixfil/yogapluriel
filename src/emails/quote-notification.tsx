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

interface QuoteNotificationEmailProps {
  nom: string;
  telephone: string;
  email: string;
  message: string;
  isUrgent: boolean;
  source: string;
  ipAddress?: string | null;
  createdAt: string;
  // Tracking source
  sourceUrl?: string;
  sourceFormType?: string;
  referrer?: string;
}

export const QuoteNotificationEmail = ({
  nom = 'Jean Dupont',
  telephone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  message = 'Demande de contact...',
  isUrgent = false,
  source = 'website_quote_form',
  ipAddress,
  createdAt = new Date().toISOString(),
  sourceUrl,
  sourceFormType,
  referrer,
}: QuoteNotificationEmailProps) => {
  const formattedDate = new Date(createdAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const emailTitle = isUrgent ? 'DEMANDE URGENTE' : 'Nouvelle demande de contact';

  return (
    <Html>
      <Head />
      <Preview>
        {isUrgent ? 'URGENT - Nouvelle demande' : 'Nouvelle demande de contact'} - FormDeToit
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header unifié */}
          <EmailHeader isAdmin />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>{emailTitle}</Heading>

            {isUrgent && (
              <Section style={urgentAlert}>
                <Text style={urgentAlertText}>
                  Cette demande a été marquée comme urgente.<br />
                  Contacter le client rapidement.
                </Text>
              </Section>
            )}

            {/* Client Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>Informations client :</Text>
              <Text style={infoLine}>
                <strong>Nom :</strong> {nom}
              </Text>
              <Text style={infoLine}>
                <strong>Téléphone :</strong> <a href={`tel:${telephone}`} style={phoneLink}>{telephone}</a>
              </Text>
              <Text style={infoLine}>
                <strong>Email :</strong> <a href={`mailto:${email}`} style={emailLink}>{email}</a>
              </Text>
              <Text style={infoLine}>
                <strong>Type :</strong> {isUrgent ? 'Intervention urgente' : 'Demande de contact'}
              </Text>
              <Text style={infoLine}>
                <strong>Reçu le :</strong> {formattedDate}
              </Text>
            </Section>

            {/* Message */}
            <Section style={messageBox}>
              <Text style={messageTitle}>Description du projet :</Text>
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

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Email automatique envoyé par le système FormDeToit.<br />
              Ne pas répondre directement à cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default QuoteNotificationEmail;

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

const urgentAlert = {
  backgroundColor: '#FEE2E2',
  border: '2px solid #DC2626',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 20px 0',
};

const urgentAlertText = {
  color: '#7F1D1D',
  fontSize: '15px',
  fontWeight: '600',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
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

const footer = {
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#9CA3AF',
  fontSize: '11px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '0',
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
  fontWeight: '600',
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

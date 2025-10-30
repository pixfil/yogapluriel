import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';
import EmailHeader from './components/EmailHeader';
import EmailFooter from './components/EmailFooter';

interface JobApplicationNotificationEmailProps {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  message?: string;
  cvUrl: string;
  coverLetterUrl?: string;
  source: string;
  ipAddress?: string | null;
  createdAt: string;
}

export const JobApplicationNotificationEmail = ({
  name = 'Jean Dupont',
  email = 'jean.dupont@email.com',
  phone = '06 12 34 56 78',
  jobTitle = 'Couvreur-Zingueur H/F',
  message,
  cvUrl = 'https://example.com/cv.pdf',
  coverLetterUrl,
  source = 'website_popup',
  ipAddress,
  createdAt = new Date().toISOString(),
}: JobApplicationNotificationEmailProps) => {
  const formattedDate = new Date(createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sourceLabels: Record<string, string> = {
    website_popup: 'Popup site web',
    website_job_page: 'Page offres d\'emploi',
    other: 'Autre',
  };

  return (
    <Html>
      <Head />
      <Preview>
        Nouvelle candidature - {jobTitle} - {name}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader isAdmin />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>
              📄 Nouvelle Candidature Reçue
            </Heading>

            <Section style={alertBox}>
              <Text style={alertText}>
                Une nouvelle candidature a été soumise pour le poste de <strong>{jobTitle}</strong>.<br />
                Vous pouvez consulter les détails ci-dessous et télécharger les documents joints.
              </Text>
            </Section>

            {/* Candidat Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>👤 Informations du candidat</Text>
              <Text style={infoLine}>
                <strong>Nom :</strong> {name}
              </Text>
              <Text style={infoLine}>
                <strong>Email :</strong>{' '}
                <Link href={`mailto:${email}`} style={link}>
                  {email}
                </Link>
              </Text>
              <Text style={infoLine}>
                <strong>Téléphone :</strong>{' '}
                <Link href={`tel:${phone.replace(/\s/g, '')}`} style={link}>
                  {phone}
                </Link>
              </Text>
            </Section>

            {/* Job Info */}
            <Section style={infoBox}>
              <Text style={infoTitle}>💼 Poste visé</Text>
              <Text style={infoLine}>
                <strong>{jobTitle}</strong>
              </Text>
            </Section>

            {/* Message */}
            {message && (
              <Section style={messageBox}>
                <Text style={messageTitle}>✉️ Message de motivation</Text>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            {/* Documents */}
            <Section style={documentsBox}>
              <Text style={documentsTitle}>📎 Documents joints</Text>
              <Button href={cvUrl} style={downloadButton}>
                📄 Télécharger le CV
              </Button>
              {coverLetterUrl && (
                <Button href={coverLetterUrl} style={downloadButtonSecondary}>
                  📝 Télécharger la lettre de motivation
                </Button>
              )}
            </Section>

            {/* Metadata */}
            <Section style={metadataBox}>
              <Text style={metadataTitle}>Métadonnées</Text>
              <Text style={metadataLine}>
                <strong>Date :</strong> {formattedDate}
              </Text>
              <Text style={metadataLine}>
                <strong>Source :</strong> {sourceLabels[source] || source}
              </Text>
              {ipAddress && (
                <Text style={metadataLine}>
                  <strong>IP :</strong> {ipAddress}
                </Text>
              )}
            </Section>

            {/* CTA Admin */}
            <Section style={{textAlign: 'center' as const, marginTop: '24px'}}>
              <Button
                href="https://formdetoit.fr/admin/candidatures"
                style={adminButton}
              >
                🔗 Voir dans l'interface admin
              </Button>
            </Section>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default JobApplicationNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '650px',
  backgroundColor: '#ffffff',
};

const content = {
  padding: '40px 30px',
};

const title = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const alertBox = {
  backgroundColor: '#FEF3C7',
  border: '2px solid #F59E0B',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px 0',
};

const alertText = {
  color: '#78350F',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 16px 0',
};

const infoTitle = {
  color: '#000000',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoLine = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '6px 0',
};

const messageBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 16px 0',
};

const messageTitle = {
  color: '#1E40AF',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const messageText = {
  color: '#1F2937',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const documentsBox = {
  backgroundColor: '#F0FDF4',
  border: '2px solid #10B981',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const documentsTitle = {
  color: '#065F46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const downloadButton = {
  backgroundColor: '#10B981',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  display: 'inline-block',
  margin: '8px',
};

const downloadButtonSecondary = {
  backgroundColor: '#3B82F6',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  display: 'inline-block',
  margin: '8px',
};

const metadataBox = {
  backgroundColor: '#F9FAFB',
  borderTop: '1px solid #E5E7EB',
  padding: '16px',
  margin: '16px 0 0 0',
};

const metadataTitle = {
  color: '#6B7280',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
};

const metadataLine = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0',
};

const adminButton = {
  backgroundColor: '#F59E0B',
  color: '#000000',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '14px 28px',
  borderRadius: '8px',
  display: 'inline-block',
};

const link = {
  color: '#3B82F6',
  textDecoration: 'none',
};

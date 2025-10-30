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

interface DetailedQuoteNotificationEmailProps {
  nom: string;
  telephone: string;
  email: string;
  propertyAddress: string;
  projectNature: string[];
  objectives?: string[];
  timeline?: string;
  budgetRange?: string;
  needsAidSupport?: boolean;
  createdAt: string;
  // Tracking source
  sourceUrl?: string;
  sourceFormType?: string;
  referrer?: string;
}

export const DetailedQuoteNotificationEmail = ({
  nom = 'Jean Dupont',
  telephone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  propertyAddress = '1 Rue de l\'Exemple, 67000 Strasbourg',
  projectNature = ['isolation-toiture'],
  objectives,
  timeline,
  budgetRange,
  needsAidSupport,
  createdAt = new Date().toISOString(),
  sourceUrl,
  sourceFormType,
  referrer,
}: DetailedQuoteNotificationEmailProps) => {
  const formattedDate = new Date(createdAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const timelineLabels: { [key: string]: string } = {
    'urgent': 'Urgent (moins de 1 mois)',
    'dans_3_mois': 'Dans 2-3 mois',
    'dans_6_mois': 'Dans 4-6 mois',
    'flexible': 'Flexible',
  };

  return (
    <Html>
      <Head />
      <Preview>Nouvelle demande détaillée - FormDeToit</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader isAdmin />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Nouvelle demande détaillée</Heading>

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
                <strong>Adresse du bien :</strong> {propertyAddress}
              </Text>
              <Text style={infoLine}>
                <strong>Reçu le :</strong> {formattedDate}
              </Text>
            </Section>

            {/* Project Details */}
            <Section style={projectBox}>
              <Text style={projectTitle}>Détails du projet :</Text>
              <Text style={projectLine}>
                <strong>Nature des travaux :</strong><br />
                {projectNature.join(', ')}
              </Text>
              {timeline && (
                <Text style={projectLine}>
                  <strong>Délai souhaité :</strong> {timelineLabels[timeline] || timeline}
                </Text>
              )}
              {budgetRange && (
                <Text style={projectLine}>
                  <strong>Budget envisagé :</strong> {budgetRange}
                </Text>
              )}
              {objectives && objectives.length > 0 && (
                <Text style={projectLine}>
                  <strong>Objectifs :</strong> {objectives.join(', ')}
                </Text>
              )}
              {needsAidSupport !== undefined && (
                <Text style={projectLine}>
                  <strong>Accompagnement aides :</strong> {needsAidSupport ? 'Oui' : 'Non'}
                </Text>
              )}
            </Section>

            <Section style={ctaBox}>
              <Text style={ctaText}>
                <strong>Action requise :</strong><br />
                1. Retrouvez la demande sur l'interface admin<br />
                2. Contacter le client sous 48h pour planifier une visite
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
              Pour consulter le dossier complet : <br />
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

export default DetailedQuoteNotificationEmail;

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

const alertBox = {
  backgroundColor: '#DBEAFE',
  border: '2px solid #3B82F6',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 20px 0',
};

const alertText = {
  color: '#1E40AF',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '20px',
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

const projectBox = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #F59E0B',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const projectTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const projectLine = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '10px 0',
};

const ctaBox = {
  backgroundColor: '#F0FDF4',
  border: '1px solid #10B981',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const ctaText = {
  color: '#065F46',
  fontSize: '13px',
  lineHeight: '20px',
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

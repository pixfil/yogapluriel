import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import EmailHeader from './components/EmailHeader';
import EmailFooter from './components/EmailFooter';

interface QuoteConfirmationEmailProps {
  nom: string;
  telephone: string;
  email: string;
  message: string;
  isUrgent: boolean;
}

export const QuoteConfirmationEmail = ({
  nom = 'Jean Dupont',
  telephone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  message = 'Demande de contact...',
  isUrgent = false,
}: QuoteConfirmationEmailProps) => {
  const emailTitle = isUrgent ? 'Demande urgente bien reçue' : 'Demande de contact bien reçue';

  return (
    <Html>
      <Head />
      <Preview>{emailTitle} - FormDeToit</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header unifié */}
          <EmailHeader />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>{emailTitle} !</Heading>

            <Text style={paragraph}>
              Bonjour {nom},
            </Text>

            <Text style={paragraph}>
              Nous avons bien reçu votre {isUrgent ? "demande d'intervention urgente" : 'demande de contact'} et vous en remercions.
            </Text>

            {isUrgent && (
              <Section style={urgentBox}>
                <Text style={urgentText}>
                  Votre demande a été marquée comme <strong>urgente</strong>.<br />
                  Notre équipe va vous contacter dans les plus brefs délais, généralement sous 2 heures pendant les horaires d'ouverture.
                </Text>
              </Section>
            )}

            {!isUrgent && (
              <Text style={paragraph}>
                Notre équipe va étudier votre projet et vous recontactera sous 24 à 48 heures ouvrées pour discuter de vos besoins et planifier un rendez-vous si nécessaire.
              </Text>
            )}

            {/* Recap */}
            <Section style={recapBox}>
              <Text style={recapTitle}>Récapitulatif de votre demande :</Text>
              <Text style={recapLine}>
                <strong>Nom :</strong> {nom}
              </Text>
              <Text style={recapLine}>
                <strong>Téléphone :</strong> {telephone}
              </Text>
              <Text style={recapLine}>
                <strong>Email :</strong> {email}
              </Text>
              <Text style={recapLine}>
                <strong>Type :</strong> {isUrgent ? 'Intervention urgente' : 'Demande de contact'}
              </Text>
              <Text style={recapLine}>
                <strong>Message :</strong> {message}
              </Text>
            </Section>

            <Text style={paragraph}>
              En attendant, n'hésitez pas à nous joindre directement au <strong>03 88 75 66 53</strong>.
            </Text>
          </Section>

          {/* Footer unifié */}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default QuoteConfirmationEmail;

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
  padding: '40px 30px',
};

const title = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const urgentBox = {
  backgroundColor: '#FEE2E2',
  border: '2px solid #DC2626',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const urgentText = {
  color: '#7F1D1D',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
};

const recapBox = {
  backgroundColor: '#F9FAFB',
  border: '2px solid #F59E0B',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const recapTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const recapLine = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

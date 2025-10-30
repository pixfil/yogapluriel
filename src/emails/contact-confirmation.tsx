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

interface ContactConfirmationEmailProps {
  nom: string;
  telephone?: string;
  email: string;
  message: string;
}

export const ContactConfirmationEmail = ({
  nom = 'Jean Dupont',
  telephone,
  email = 'jean.dupont@email.com',
  message = 'Bonjour, je souhaite vous contacter...',
}: ContactConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre message a bien été reçu - FormDeToit</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header unifié */}
          <EmailHeader />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Message bien reçu !</Heading>

            <Text style={paragraph}>
              Bonjour {nom},
            </Text>

            <Text style={paragraph}>
              Nous avons bien reçu votre demande de contact et vous en remercions.
            </Text>

            <Text style={paragraph}>
              Notre équipe va l'examiner et vous recontactera dans les plus brefs délais, généralement sous 24 heures ouvrées.
            </Text>

            {/* Recap */}
            <Section style={recapBox}>
              <Text style={recapTitle}>Récapitulatif de votre demande :</Text>
              <Text style={recapLine}>
                <strong>Nom :</strong> {nom}
              </Text>
              {telephone && (
                <Text style={recapLine}>
                  <strong>Téléphone :</strong> {telephone}
                </Text>
              )}
              <Text style={recapLine}>
                <strong>Email :</strong> {email}
              </Text>
              <Text style={recapLine}>
                <strong>Message :</strong> {message}
              </Text>
            </Section>

            <Text style={paragraph}>
              Si vous avez des questions ou souhaitez nous joindre rapidement, n'hésitez pas à nous appeler au <strong>03 88 75 66 53</strong>.
            </Text>
          </Section>

          {/* Footer unifié */}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default ContactConfirmationEmail;

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

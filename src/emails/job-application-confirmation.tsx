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
} from '@react-email/components';
import * as React from 'react';
import EmailHeader from './components/EmailHeader';
import EmailFooter from './components/EmailFooter';

interface JobApplicationConfirmationEmailProps {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  message?: string;
}

export const JobApplicationConfirmationEmail = ({
  name = 'Jean Dupont',
  email = 'jean.dupont@email.com',
  phone = '06 12 34 56 78',
  jobTitle = 'Couvreur-Zingueur H/F',
  message,
}: JobApplicationConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Candidature bien reçue - {jobTitle} - FormDeToit
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>
              Candidature bien reçue !
            </Heading>

            <Text style={paragraph}>
              Bonjour {name},
            </Text>

            <Text style={paragraph}>
              Nous avons bien reçu votre candidature pour le poste de <strong>{jobTitle}</strong> et vous en remercions.
            </Text>

            <Text style={paragraph}>
              Notre équipe va étudier votre profil avec attention. Si votre candidature correspond à nos besoins actuels, nous vous recontacterons dans les plus brefs délais pour vous proposer un entretien.
            </Text>

            {/* Recap */}
            <Section style={recapBox}>
              <Text style={recapTitle}>Récapitulatif de votre candidature :</Text>
              <Text style={recapLine}>
                <strong>Nom :</strong> {name}
              </Text>
              <Text style={recapLine}>
                <strong>Email :</strong> {email}
              </Text>
              <Text style={recapLine}>
                <strong>Téléphone :</strong> {phone}
              </Text>
              <Text style={recapLine}>
                <strong>Poste :</strong> {jobTitle}
              </Text>
              {message && (
                <Text style={recapLine}>
                  <strong>Message :</strong> {message}
                </Text>
              )}
            </Section>

            <Text style={paragraph}>
              Nous vous souhaitons bonne chance dans votre recherche d'emploi !
            </Text>

            <Text style={paragraph}>
              Cordialement,<br />
              <strong>L'équipe FormDeToit</strong>
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default JobApplicationConfirmationEmail;

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

const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
};

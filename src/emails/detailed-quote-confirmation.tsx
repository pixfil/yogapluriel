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

interface DetailedQuoteConfirmationEmailProps {
  nom: string;
  telephone: string;
  email: string;
  propertyAddress: string;
  projectNature: string[];
  timeline?: string;
}

export const DetailedQuoteConfirmationEmail = ({
  nom = 'Jean Dupont',
  telephone = '06 12 34 56 78',
  email = 'jean.dupont@email.com',
  propertyAddress = '1 Rue de l\'Exemple, 67000 Strasbourg',
  projectNature = ['isolation-toiture', 'remplacement-tuiles'],
  timeline = 'dans_3_mois',
}: DetailedQuoteConfirmationEmailProps) => {
  const timelineLabels: { [key: string]: string } = {
    'urgent': 'Urgent (moins de 1 mois)',
    'dans_3_mois': 'Dans 2-3 mois',
    'dans_6_mois': 'Dans 4-6 mois',
    'flexible': 'Flexible',
  };

  return (
    <Html>
      <Head />
      <Preview>Votre demande détaillée a bien été reçue - FormDeToit</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          {/* Content */}
          <Section style={content}>
            <Heading style={title}>Demande complète bien reçue !</Heading>

            <Text style={paragraph}>
              Bonjour {nom},
            </Text>

            <Text style={paragraph}>
              Nous vous remercions d'avoir pris le temps de remplir notre questionnaire détaillé.
              Votre demande a été bien reçue et est actuellement en cours d'analyse par notre équipe.
            </Text>


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
                <strong>Adresse du bien :</strong> {propertyAddress}
              </Text>
              <Text style={recapLine}>
                <strong>Nature des travaux :</strong> {projectNature.join(', ')}
              </Text>
              {timeline && (
                <Text style={recapLine}>
                  <strong>Délai souhaité :</strong> {timelineLabels[timeline] || timeline}
                </Text>
              )}
            </Section>

            <Text style={paragraph}>
              <strong>Prochaines étapes :</strong>
            </Text>
            <ul style={list}>
              <li style={listItem}>
                Notre équipe étudie votre dossier (48 heures)
              </li>
              <li style={listItem}>
                Nous vous recontactons pour planifier une visite technique si nécessaire
              </li>
              <li style={listItem}>
                Vous recevez votre devis détaillé et personnalisé (suite au RDV)
              </li>
            </ul>

            <Text style={paragraph}>
              Si vous avez des questions urgentes, n'hésitez pas à nous joindre au <strong>03 88 75 66 53</strong>.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export default DetailedQuoteConfirmationEmail;

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

const highlightBox = {
  backgroundColor: '#DBEAFE',
  border: '2px solid #3B82F6',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const highlightText = {
  color: '#1E40AF',
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

const list = {
  paddingLeft: '20px',
  margin: '12px 0',
};

const listItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
};

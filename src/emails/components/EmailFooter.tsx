import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';

export const EmailFooter = () => {
  return (
    <>
      <Hr style={hr} />
      <Section style={footer}>
        <Text style={footerText}>
          <strong>FORMDETOIT</strong><br />
          Couverture - Zinguerie - Isolation<br />
          Certifié RGE QualiPAC et RGE Études<br />
          <br />
          4 rue Bernard Stalter<br />
          67114 Eschau<br />
          <br />
          Tél : <Link href="tel:0388756653" style={link}>03 88 75 66 53</Link><br />
          Email : <Link href="mailto:contact@formdetoit.fr" style={link}>contact@formdetoit.fr</Link><br />
          <Link href="https://formdetoit.fr" style={link}>
            www.formdetoit.fr
          </Link>
          <br /><br />
          <strong>Horaires :</strong><br />
          Lundi : 8h30 - 12h<br />
          Mardi : 8h30 - 12h30, 13h30 - 17h<br />
          Mercredi : 8h30 - 12h30<br />
          Jeudi : 8h30 - 12h<br />
          Vendredi : 10h - 12h30, 13h30 - 16h30
        </Text>
      </Section>
    </>
  );
};

export default EmailFooter;

// Styles
const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
};

const footer = {
  padding: '30px',
  backgroundColor: '#f9fafb',
};

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center' as const,
  margin: '0',
};

const link = {
  color: '#F59E0B',
  textDecoration: 'none',
};

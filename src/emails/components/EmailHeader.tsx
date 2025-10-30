import { Heading, Img, Section, Text } from '@react-email/components';
import * as React from 'react';

interface EmailHeaderProps {
  isAdmin?: boolean;
}

export const EmailHeader = ({ isAdmin = false }: EmailHeaderProps) => {
  return (
    <Section style={header}>
      {/* Logo */}
      <Img
        src="https://res.cloudinary.com/doj84owtw/image/upload/v1761062800/formdetoit_logo_noir.webp"
        alt="FormDeToit Logo"
        width="120"
        height="auto"
        style={logo}
      />

      {/* Company Name */}
      <Heading style={companyName}>
        FORMDETOIT{isAdmin ? ' - ADMIN' : ''}
      </Heading>

      {/* Tagline */}
      <Text style={tagline}>
        {isAdmin ? 'Notification Automatique' : 'Couverture - Zinguerie - Isolation'}
      </Text>
    </Section>
  );
};

export default EmailHeader;

// Styles
const header = {
  backgroundColor: '#FDC300',
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto 15px',
  display: 'block',
};

const companyName = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '2px',
};

const tagline = {
  color: '#000000',
  fontSize: '14px',
  margin: '10px 0 0 0',
  fontWeight: '500',
};

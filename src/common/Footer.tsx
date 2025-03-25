import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f1f1f1' }}>
      <p>&copy; {currentYear} Your Company. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

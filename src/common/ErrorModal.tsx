import React, { useEffect } from 'react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the modal after 2.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p>{message}</p>
        <button onClick={onClose} style={buttonStyle}>
          OK
        </button>
      </div>
    </div>
  );
};

// Styles for modal and overlay
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default ErrorModal;

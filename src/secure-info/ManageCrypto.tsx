import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

// Export the encryption function and getFixedIV for use in CreateFile.tsx
export const getFixedIV = (ivString: string) => {
  return CryptoJS.enc.Utf8.parse(ivString);
};

export const splitter = '¦';

export const encryptWithFixedIV = (text: string, saltKey: string, ivString: string): string => {
  const key = CryptoJS.enc.Utf8.parse(saltKey);
  const iv = getFixedIV(ivString);  // Use dynamic IV string

  // Encrypt the text
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

  // Return the Base64 encoded string of the encrypted text
  return encrypted.toString();  
};

export const decryptWithFixedIV = (encryptedText: string, saltKey: string, ivString: string): string => {
  const key = CryptoJS.enc.Utf8.parse(saltKey);  // Same key
  const iv = getFixedIV(ivString);  // Same IV

  // Decrypt the text
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

  // Return the decrypted text as a string
  return decrypted.toString(CryptoJS.enc.Utf8);  
};

const EncryptionComponent: React.FC = () => {
  const [textToEncrypt, setTextToEncrypt] = useState<string>('This is some sensitive data.');
  const [saltKey, setSaltKey] = useState<string>('mySaltKey');
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');

  // Encrypt the text
  const handleEncrypt = () => {
    try {
      const encrypted = encryptWithFixedIV(textToEncrypt, saltKey, '0000000000000000'); // Default IV
      setEncryptedText(encrypted);
    } catch (error) {
      console.error('Encryption Error:', error);
    }
  };

  // Decrypt the text
  const handleDecrypt = () => {
    try {
      const decrypted = decryptWithFixedIV(encryptedText, saltKey, '0000000000000000'); // Default IV
      setDecryptedText(decrypted);
    } catch (error) {
      console.error('Decryption Error:', error);
    }
  };

  return (
    <div>
      <h3>Encryption/Decryption Example</h3>
      
      {/* Text to Encrypt */}
      <div>
        <label>Text to Encrypt: </label>
        <textarea
          value={textToEncrypt}
          onChange={(e) => setTextToEncrypt(e.target.value)}
          rows={8} 
          cols={50}
        />
      </div>
      
      {/* Salt Key */}
      <div>
        <label>Password: </label>
        <input
          type="text"
          value={saltKey}
          onChange={(e) => setSaltKey(e.target.value)}
        />
      </div>

      {/* Encrypt Button */}
      <button onClick={handleEncrypt}>Encrypt</button>

      {/* Display Encrypted Text */}
      <div>
        <h4>Encrypted Text:</h4>
        <textarea value={encryptedText} readOnly rows={8} cols={50} />
      </div>

      {/* Decrypt Button */}
      <button onClick={handleDecrypt}>Decrypt</button>

      {/* Display Decrypted Text */}
      <div>
        <h4>Decrypted Text:</h4>
        <textarea value={decryptedText} readOnly rows={8} cols={50} />
      </div>
    </div>
  );
};

export default EncryptionComponent;


// import React, { useState } from 'react';
// import CryptoJS from 'crypto-js';

// // Export the encryption function and getFixedIV for use in CreateFile.tsx
// export const getFixedIV = (ivString: string) => {
//   return CryptoJS.enc.Utf8.parse(ivString);
// }

// export const splitter = '¦';

// export const encryptWithFixedIV = (text: string, saltKey: string, ivString: string): string => {
//   const key = CryptoJS.enc.Utf8.parse(saltKey);
//   const iv = getFixedIV(ivString);  // Use dynamic IV string

//   // Encrypt the text
//   const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

//   return encrypted.toString();  // Return the encrypted string
// }

// export const decryptWithFixedIV = (encryptedText: string, saltKey: string, ivString: string): string => {
//   const key = CryptoJS.enc.Utf8.parse(saltKey);  // Same key
//   const iv = getFixedIV(ivString);  // Same IV

//   const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  
//   return decrypted.toString(CryptoJS.enc.Utf8);  // Return decrypted text as string
// }

// const EncryptionComponent: React.FC = () => {
//   const [textToEncrypt, setTextToEncrypt] = useState<string>('This is some sensitive data.');
//   const [saltKey, setSaltKey] = useState<string>('mySaltKey');
//   const [encryptedText, setEncryptedText] = useState<string>('');
//   const [decryptedText, setDecryptedText] = useState<string>('');

//   // Encrypt the text
//   const handleEncrypt = () => {
//     const encrypted = encryptWithFixedIV(textToEncrypt, saltKey, '0000000000000000'); // Default IV
//     setEncryptedText(encrypted);
//   };

//   // Decrypt the text
//   const handleDecrypt = () => {
//     const decrypted = decryptWithFixedIV(encryptedText, saltKey, '0000000000000000'); // Default IV
//     setDecryptedText(decrypted);
//   };

//   return (
//     <div>
//       <h3>Encryption/Decryption Example</h3>
      
//       {/* Text to Encrypt */}
//       <div>
//         <label>Text to Encrypt: </label>
//         <textarea value={textToEncrypt} onChange={(e) => setTextToEncrypt(e.target.value)} />
//       </div>
      
//       {/* Salt Key */}
//       <div>
//         <label>Password: </label>
//         <input type="text" value={saltKey} onChange={(e) => setSaltKey(e.target.value)} />
//       </div>

//       {/* Encrypt Button */}
//       <button onClick={handleEncrypt}>Encrypt</button>

//       {/* Display Encrypted Text */}
//       <div>
//         <h4>Encrypted Text:</h4>
//         <textarea value={encryptedText} readOnly />
//       </div>

//       {/* Decrypt Button */}
//       <button onClick={handleDecrypt}>Decrypt</button>

//       {/* Display Decrypted Text */}
//       <div>
//         <h4>Decrypted Text:</h4>
//         <textarea value={decryptedText} readOnly />
//       </div>
//     </div>
//   );
// };

// export default EncryptionComponent;

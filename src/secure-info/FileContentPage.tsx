import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { decryptWithFixedIV, encryptWithFixedIV, splitter } from './ManageCrypto';

function FileContentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileName, fileContent } = location.state || {};
  const [saltKey, setSaltKey] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [error, setError] = useState('');
  let [decryptedContent, setDecryptedContent] = useState<{ key: string; value: string }[]>([]);

  const extractSaltKey = (content: string) => {
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine;
  };

  const decryptFileContent = (content: string, saltKey: string) => {
    const ivString = '0000000000000000'; 
    const lines = content.split('\n');
    let decryptedContent = [];

    // Iterate over the lines and decrypt them (excluding the last line which is the encrypted salt key)
    for (let i = 0; i < lines.length - 1; i++) {
      const decryptedLine = decryptWithFixedIV(lines[i], saltKey, ivString);
      
      // Assuming that the decrypted line will be in the format "key:value"
      const [key, value] = decryptedLine.split(splitter); // Adjust this if your key-value separator is different

      if (key && value) {
        decryptedContent.push({ key: key.trim(), value: value.trim() });
      }
    }
    
    return decryptedContent;
  };

  // Handle submit for salt key and password
  const handleSubmit = () => {
    if (!saltKey) {
      setError('Please provide a password.');
      return;
    }

    if (!fileContent) {
      setError('No file content to process.');
      return;
    }

    const lastLine = extractSaltKey(fileContent);

    const encryptedSaltKey = encryptWithFixedIV(saltKey, saltKey, '0000000000000000'); // Encrypt the provided salt key to validate

    if (encryptedSaltKey === lastLine) {
      setError('');
      // Decrypt the file content after password is validated
      const decrypted = decryptFileContent(fileContent, saltKey);
      setDecryptedContent(decrypted); // Set the decrypted content (an array of { key, value })
      setIsPopupVisible(false); // Hide the password prompt
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/'); // Navigate back to the previous page
  };

  return (
    <div id="fileContentPage">
      {isPopupVisible && (
        <div className="popup">
          <h3>Enter Password</h3>
          <input
            type="password"
            placeholder="Password"
            value={saltKey}
            onChange={(e) => setSaltKey(e.target.value)} // Update the salt key state on input change
          />
          <button onClick={handleSubmit}>Submit</button>
          {error && <p className="error">{error}</p>} {/* Display error if password is invalid */}
        </div>
      )}

      {!isPopupVisible && (
        <div>
          <h3>File Content</h3>
          <h4>File Name: {fileName}</h4>
          {decryptedContent.length > 0 ? (
            <div>
              <ul>
                {decryptedContent.map((item, index) => (
                  <li key={index}>
                    <strong>{item.key},  {item.value} </strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <p>No decrypted content available. Please check the password or file content.</p> {/* More descriptive message */}
            </div>
          )}
          <button onClick={handleBack}>Back</button> {/* Button to go back to the previous page */}
        </div>
      )}
    </div>
  );
}

export default FileContentPage;

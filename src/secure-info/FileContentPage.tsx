import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { decryptWithFixedIV, encryptWithFixedIV, splitter } from './ManageCrypto';
import { secureInfoModel } from "../models/SecureInfoModel";

function FileContentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileName, fileContent } = location.state || {};
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [error, setError] = useState('');
  let [decryptedContent, setDecryptedContent] = useState<{ key: string; value: string }[]>([]);
  const [saltKey, setSaltKey] = useState<string>(''); // Use the singleton saltKey
  const [iv, setIv] = useState<string>(secureInfoModel.iv);

  const manageSaltKeyAndIv = (e : React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const newVal = val.split('').reverse().join('');
      const ivStr = newVal+newVal;
      
      setSaltKey(val);
      
      setIv(ivStr);
      secureInfoModel.iv = ivStr;  
    }

  const extractSaltKey = (content: string) => {
    const lines = content.split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine;
  };

  const decryptFileContent = (content: string, saltKey: string) => {
    const ivString = iv; 
    const lines = content.split('\n');
    let decryptedContent = [];

    for (let i = 0; i < lines.length - 1; i++) {
      const decryptedLine = decryptWithFixedIV(lines[i], saltKey, ivString);
      
      const [key, value] = decryptedLine.split(splitter);

      if (key && value) {
        decryptedContent.push({ key: key.trim(), value: value.trim() });
      }
    }
    
    return decryptedContent;
  };

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

    const encryptedSaltKey = encryptWithFixedIV(saltKey, saltKey, iv);

    if (encryptedSaltKey === lastLine) {
      setError('');
      const decrypted = decryptFileContent(fileContent, saltKey);
      setDecryptedContent(decrypted);
      setIsPopupVisible(false);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
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
            onChange={(e) => manageSaltKeyAndIv(e)}
          />
          <button onClick={handleSubmit}>Submit</button>
          {error && <p className="error">{error}</p>}
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
              <p>No decrypted content available. Please check the password or file content.</p>
            </div>
          )}
          <button onClick={handleBack}>Back</button>
        </div>
      )}
    </div>
  );
}

export default FileContentPage;

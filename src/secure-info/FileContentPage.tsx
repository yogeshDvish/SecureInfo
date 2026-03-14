import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decryptWithFixedIV, splitter, extractFromPngAsync } from './ManageCrypto';
import '../styles/FileContentPage.css';
import '../Global.css';
import { ReactComponent as SinfoLogo } from '../assets/logo.svg';

function FileContentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentFileName, setCurrentFileName] = useState<string>(location.state?.fileName || '');
  const [currentFileBuffer, setCurrentFileBuffer] = useState<ArrayBuffer | null>(location.state?.fileBuffer || null);

  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [error, setError] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<{ key: string; value: string }[]>([]);
  const [saltKey, setSaltKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSinfoFile = (name: string) => name.toLowerCase().endsWith('.sinfo');

  const getPayload = async (): Promise<string> => {
    if (!isSinfoFile(currentFileName) || !currentFileBuffer) {
      setError('Invalid file. Please upload a .sinfo file.');
      return '';
    }
    return await extractFromPngAsync(currentFileBuffer);
  };

  const decryptFileContent = async (
    payload: string,
    password: string
  ): Promise<{ key: string; value: string }[]> => {
    const lines = payload.split('\n').filter((l) => l.trim() !== '');
    const dataLines = lines.slice(0, lines.length - 1);
    const results: { key: string; value: string }[] = [];
    for (const line of dataLines) {
      const decrypted = await decryptWithFixedIV(line, password);
      if (!decrypted) continue;
      const [key, value] = decrypted.split(splitter);
      if (key && value) results.push({ key: key.trim(), value: value.trim() });
    }
    return results;
  };

  const handleSubmit = async () => {
    if (!saltKey) { setError('Please provide a password.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const payload = await getPayload();
      if (!payload) { setIsLoading(false); return; }
      const lines = payload.split('\n').filter((l: string) => l.trim() !== '');
      const verificationToken = lines[lines.length - 1];
      const decryptedToken = await decryptWithFixedIV(verificationToken, saltKey);
      if (decryptedToken === saltKey) {
        const decrypted = await decryptFileContent(payload, saltKey);
        setDecryptedContent(decrypted);
        setIsPopupVisible(false);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch {
      setError('Invalid password or corrupted file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnother = () => {
    if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSinfoFile(file.name)) { setError('Invalid file type. Please upload a .sinfo file.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCurrentFileName(file.name);
      setCurrentFileBuffer(ev.target?.result as ArrayBuffer);
      setSaltKey('');
      setError('');
      setDecryptedContent([]);
      setIsPopupVisible(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBack = () => navigate('/');

  // ── Edit — pass saltKey so CreateFile can use old password ───────────────
  const handleEdit = () => {
    const filenameWithoutExt = currentFileName.replace(/\.sinfo$/i, '');
    navigate('/create-file', {
      state: {
        editRows: decryptedContent,
        editFilename: filenameWithoutExt,
        editPassword: saltKey,       // carry old password
      }
    });
  };

  return (
    <div id="fileContentPage">

      <input ref={fileInputRef} type="file" accept=".sinfo" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Password popup ── */}
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-filename cursive-font">
            <SinfoLogo className="sinfo-icon" />
            <span title={currentFileName}>{currentFileName}</span>
          </div>
          <h3 className="cursive-font">Enter Password</h3>
          <input
            className="bordercolorbtn cursive-font"
            type="password"
            placeholder="Password"
            value={saltKey}
            onChange={(e) => setSaltKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="popup-actions">
            <button className="filledcolorbtn cursive-font" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Decrypting...' : 'Submit'}
            </button>
            <button className="bordercolorbtn cursive-font" onClick={handleSelectAnother} disabled={isLoading}>
              Select Another File
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      )}

      {/* ── Decrypted content ── */}
      {!isPopupVisible && (
        <div id="file-content">

          {/* ── Top bar: filename + buttons ── */}
          <div id="file-content-topbar">
            <h4 className="cursive-font"><SinfoLogo className="sinfo-icon" /> {currentFileName}</h4>
            <div id="file-content-actions">
              <button className="filledcolorbtn cursive-font" onClick={handleEdit}>✏️ Edit</button>
              <button className="bordercolorbtn cursive-font" onClick={handleSelectAnother}>📂 Select Another</button>
              <button className="bordercolorbtn cursive-font" onClick={handleBack}>← Back</button>
            </div>
          </div>

          {decryptedContent.length > 0 ? (
            <ul>
              {decryptedContent.map((item, index) => (
                <li key={index}>
                  <strong>{item.key}</strong>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No decrypted content available.</p>
          )}
        </div>
      )}

    </div>
  );
}

export default FileContentPage;
import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { decryptWithFixedIV, splitter, extractFromSinfo } from './ManageCrypto';
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
      setError('Invalid file. Please upload a .sinfo file.'); return '';
    }
    return await extractFromSinfo(currentFileBuffer);
  };

  const decryptFileContent = async (payload: string, password: string) => {
    const lines = payload.split('\n').filter(l => l.trim() !== '');
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
    setIsLoading(true); setError('');
    try {
      const payload = await getPayload();
      if (!payload) { setIsLoading(false); return; }
      const lines = payload.split('\n').filter(l => l.trim() !== '');
      const token = lines[lines.length - 1];
      const decryptedToken = await decryptWithFixedIV(token, saltKey);
      if (decryptedToken === saltKey) {
        setDecryptedContent(await decryptFileContent(payload, saltKey));
        setIsPopupVisible(false);
      } else { setError('Invalid password. Please try again.'); }
    } catch { setError('Invalid password or corrupted file.'); }
    finally { setIsLoading(false); }
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
      setCurrentFileName(file.name); setCurrentFileBuffer(ev.target?.result as ArrayBuffer);
      setSaltKey(''); setError(''); setDecryptedContent([]); setIsPopupVisible(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleEdit = () => {
    navigate('/create-file', {
      state: { editRows: decryptedContent, editFilename: currentFileName.replace(/\.sinfo$/i, ''), editPassword: saltKey }
    });
  };

  return (
    <div className="container py-4">
      <input ref={fileInputRef} type="file" accept=".sinfo" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Password popup ── */}
      {isPopupVisible && (
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-7 col-lg-5">
            <div className="p-4 text-center" style={{ borderRadius: '1rem', border: '.2rem solid #7da2a9', backgroundColor: '#f7f7f7' }}>

              {/* Filename badge */}
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3 cursive-font"
                style={{ color: '#7da2a9', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                <SinfoLogo style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
                <span>{currentFileName}</span>
              </div>

              <h5 className="cursive-font mb-3">Enter Password</h5>
              <input className="form-control cursive-font mb-3" type="password" placeholder="Password"
                value={saltKey} onChange={(e) => setSaltKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />

              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button className="btn cursive-font text-white" style={{ backgroundColor: '#7da2a9', borderRadius: '.5rem' }}
                  onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Decrypting...' : 'Submit'}</button>
                <button className="btn cursive-font" style={{ border: '.2rem solid #7da2a9', color: '#7da2a9', borderRadius: '.5rem' }}
                  onClick={handleSelectAnother} disabled={isLoading}>Select Another File</button>
              </div>

              {error && <p className="text-danger cursive-font mt-2 mb-0" style={{ fontSize: '0.85rem' }}>{error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Decrypted content ── */}
      {!isPopupVisible && (
        <div>
          {/* Top bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3"
            style={{ borderBottom: '.15rem solid #d0e0e3' }}>
            <h6 className="cursive-font m-0 d-flex align-items-center gap-2" style={{ color: '#7da2a9', wordBreak: 'break-all' }}>
              <SinfoLogo style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
              {currentFileName}
            </h6>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-sm cursive-font text-white" style={{ backgroundColor: '#7da2a9', borderRadius: '.5rem' }} onClick={handleEdit}>✏️ Edit</button>
              <button className="btn btn-sm cursive-font" style={{ border: '.2rem solid #7da2a9', color: '#7da2a9', borderRadius: '.5rem' }} onClick={handleSelectAnother}>📂 Select Another</button>
              <button className="btn btn-sm cursive-font" style={{ border: '.2rem solid #7da2a9', color: '#7da2a9', borderRadius: '.5rem' }} onClick={() => navigate('/')}>← Back</button>
            </div>
          </div>

          {/* Content list — same card style as CreateFile rows */}
          {decryptedContent.length > 0 ? (
            <div>
              {decryptedContent.map((item, index) => (
                <div key={index} className="mb-3 p-3"
                  style={{ border: '.15rem solid #d0e0e3', borderRadius: '.8rem', backgroundColor: '#f7f7f7' }}>
                  {/* Key — styled like header input */}
                  <div className="cursive-font w-100 mb-2 px-3 py-2"
                    style={{ border: '.2rem solid #7da2a9', borderRadius: '.5rem', backgroundColor: '#f7f7f7',
                      color: '#7da2a9', fontWeight: 600, wordBreak: 'break-word', display: 'block' }}>
                    {item.key}
                  </div>
                  {/* Value — styled like data textarea */}
                  <div className="cursive-font w-100 px-3 py-2"
                    style={{ border: '.2rem solid #7da2a9', borderRadius: '.5rem', backgroundColor: '#f7f7f7',
                      color: '#2c2c2c', wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                      minHeight: '80px', overflowY: 'auto', maxHeight: '20vh', display: 'block' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cursive-font text-muted">No decrypted content available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default FileContentPage;
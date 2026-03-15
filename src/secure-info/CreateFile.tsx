import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import '../styles/CreateFile.css';
import '../Global.css';
import { encryptWithFixedIV, splitter, embedInSinfo} from "./ManageCrypto";
import { ReactComponent as SinfoLogo } from '../assets/logo.svg';

// ─── Popup ────────────────────────────────────────────────────────────────────
const Popup: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => (
  <div style={{ height: '100%', width: '100%', backgroundColor: 'rgba(78,78,78,0.15)', position: 'fixed', top: 0, left: 0, zIndex: 999 }}>
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: '20px', borderRadius: '1rem', color: 'black', textAlign: 'center', zIndex: 1000, border: '.2rem solid #7da2a9', backgroundColor: '#f7f7f7', height: '24vh' }}>
      <div style={{ marginBottom: '4vh' }}>{message}</div>
      <button style={{ margin: '10px', padding: '5px 10px' }} className="filledcolorbtn" onClick={onConfirm}>Yes</button>
      <button style={{ margin: '10px', padding: '5px 10px' }} className="bordercolorbtn" onClick={onCancel}>No</button>
    </div>
  </div>
);

function CreateFile() {
  const location = useLocation();
  const editRows = location.state?.editRows as { key: string; value: string }[] | undefined;
  const editFilename = location.state?.editFilename as string | undefined;
  const editPassword = location.state?.editPassword as string | undefined;
  const isEditMode = !!editRows;

  const [rows, setRows] = useState<{ key: string; value: string }[]>(
    editRows && editRows.length > 0 ? editRows : [{ key: '', value: '' }]
  );
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState(editFilename || '');
  const [saltKey, setSaltKey] = useState('');
  const [confirmSaltKey, setConfirmSaltKey] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  type PasswordStep = 'ask' | 'verify' | 'change' | 'keep';
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('ask');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const validatePasswordStrength = (pwd: string): string | null => {
    if (pwd.length < 12)           return 'Password must be at least 12 characters.';
    if (!/[A-Z]/.test(pwd))        return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(pwd))        return 'Password must include at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(pwd))        return 'Password must include at least one number (0-9).';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must include at least one special character (!@#$%...).';
    return null;
  };

  const addRow = () => setRows([{ key: '', value: '' }, ...rows]);
  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const newRows = [...rows]; newRows[index][field] = value; setRows(newRows);
  };
  const confirmRemoveRow = (index: number) => { setSelectedRowIndex(index); setShowPopup(true); };
  const handleRemoveRow = () => {
    if (selectedRowIndex !== null) {
      setRows(rows.filter((_, i) => i !== selectedRowIndex));
      setShowPopup(false); setSelectedRowIndex(null);
    }
  };
  const handleCancel = () => { setShowPopup(false); setSelectedRowIndex(null); };

  const confirmPopUp = () => {
    for (const row of rows) {
      if (!row.key.trim() || !row.value.trim()) { alert('Please fill all available rows.'); return; }
    }
    if (isEditMode) setPasswordStep('ask');
    setSaltKey(''); setConfirmSaltKey(''); setOldPasswordInput(''); setOldPasswordError('');
    setShowModal(true);
  };

  const verifyOldPassword = async () => {
    if (!oldPasswordInput) { setOldPasswordError('Please enter your old password.'); return; }
    setIsVerifying(true); setOldPasswordError('');
    try {
      if (oldPasswordInput === editPassword) setPasswordStep('change');
      else setOldPasswordError('Incorrect old password. Please try again.');
    } finally { setIsVerifying(false); }
  };

  const exportData = async (passwordOverride?: string) => {
    if (!filename.trim()) { alert('Please enter a file name.'); return; }
    const passwordToUse = passwordOverride ?? (passwordStep === 'change' ? saltKey : editPassword ?? saltKey);
    if (!passwordOverride) {
      const strengthError = validatePasswordStrength(passwordToUse);
      if (strengthError) { alert(strengthError); return; }
      if (passwordStep === 'change' && saltKey !== confirmSaltKey) { alert('Passwords do not match.'); return; }
      if (!isEditMode && saltKey !== confirmSaltKey) { alert('Passwords do not match.'); return; }
    }
    setIsExporting(true);
    try {
      const encryptedLines: string[] = [];
      for (const row of rows)
        encryptedLines.push(await encryptWithFixedIV(`${row.key}${splitter}${row.value}\n`, passwordToUse));
      const verificationToken = await encryptWithFixedIV(passwordToUse, passwordToUse);
      const sinfoBlob = embedInSinfo([...encryptedLines, verificationToken].join('\n'));
      const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(sinfoBlob);
      link.download = `${safeFilename}.sinfo`;
      link.click();
      URL.revokeObjectURL(link.href);
      setShowModal(false); setSaltKey(''); setConfirmSaltKey('');
    } catch (err) {
      console.error('Export failed:', err); alert('Export failed. Please try again.');
    } finally { setIsExporting(false); }
  };

  return (
    <div id="mainCreateDiv">
      <div className="container-fluid px-3 px-md-4" style={{ marginTop: '3vh', maxWidth: '960px', margin: '3vh auto 0' }}>
        {showPopup && <Popup message="Are you sure you want to remove this row?" onConfirm={handleRemoveRow} onCancel={handleCancel} />}

        {/* Header bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 py-2"
          style={{ position: 'sticky', top: 56, backgroundColor: '#f7f7f7', zIndex: 10, borderBottom: '.15rem solid #d0e0e3' }}>
          <h5 className="cursive-font m-0">{isEditMode ? `✏️ Editing — ${editFilename || 'File'}` : 'Please Enter Your Details...'}</h5>
          <div className="d-flex gap-2">
            <button onClick={addRow} className="cursive-font"
              style={{ backgroundColor: '#7da2a9', color: '#f7f7f7', border: 'none', borderRadius: '.5rem', padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}>
              + Add Row
            </button>
            <button onClick={confirmPopUp} className="cursive-font"
              style={{ backgroundColor: '#f7f7f7', color: '#7da2a9', border: '.2rem solid #7da2a9', borderRadius: '.5rem', padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}>
              {isEditMode ? 'Re-Download' : 'Save & Download'}
            </button>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div key={index} className="mb-3 p-3"
            style={{ border: '.15rem solid #d0e0e3', borderRadius: '.8rem', backgroundColor: '#f7f7f7' }}>
            {/* Header input */}
            <input className="cursive-font w-100 mb-2" type="text" value={row.key}
              onChange={(e) => handleChange(index, 'key', e.target.value)}
              placeholder="Enter Header"
              style={{ border: '.2rem solid #7da2a9', borderRadius: '.5rem', padding: '0.5rem 0.8rem', backgroundColor: '#f7f7f7', color: '#2c2c2c', display: 'block' }} />
            {/* Data textarea */}
            <textarea className="cursive-font w-100 mb-2" value={row.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
              placeholder="Enter Data" rows={4}
              style={{ border: '.2rem solid #7da2a9', borderRadius: '.5rem', padding: '0.5rem 0.8rem', backgroundColor: '#f7f7f7', color: '#2c2c2c', resize: 'vertical', display: 'block' }} />
            {/* Remove button — right aligned */}
            <div className="d-flex justify-content-end">
              <button className="cursive-font" onClick={() => confirmRemoveRow(index)}
                style={{ backgroundColor: '#7da2a9', color: '#f7f7f7', border: 'none', borderRadius: '.5rem', padding: '0.4rem 1.2rem', whiteSpace: 'nowrap' }}>
                ✕ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ width: 'min(90vw, 480px)' }}>

            {/* ASK */}
            {isEditMode && passwordStep === 'ask' && (
              <>
                <h3 className="cursive-font" style={{ marginBottom: '3vh' }}>Re-Download Options</h3>
                <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                  className="bordercolorbtn cursive-font" placeholder="Enter File Name"
                  style={{ textAlign: 'start', width: '100%', height: '8vh', marginBottom: '2vh' }} />
                <p className="cursive-font" style={{ color: '#555', marginBottom: '2vh', fontSize: '0.9rem' }}>
                  Do you want to keep the same password or set a new one?
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '1vh' }}>
                  <button className="filledcolorbtn cursive-font" onClick={() => exportData(editPassword!)}>Keep Same Password</button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('verify')}>Change Password</button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1vh' }}>
                  <button className="bordercolorbtn cursive-font" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </>
            )}

            {/* VERIFY */}
            {isEditMode && passwordStep === 'verify' && (
              <>
                <h3 className="cursive-font" style={{ marginBottom: '3vh' }}>Verify Old Password</h3>
                <p className="cursive-font" style={{ color: '#555', marginBottom: '1vh', fontSize: '0.9rem' }}>
                  Enter your current password to confirm identity before setting a new one.
                </p>
                <input type="password" value={oldPasswordInput}
                  onChange={(e) => { setOldPasswordInput(e.target.value); setOldPasswordError(''); }}
                  className="bordercolorbtn cursive-font" placeholder="Enter current password"
                  style={{ textAlign: 'start', width: '100%', height: '8vh' }}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOldPassword()} />
                {oldPasswordError && <p style={{ color: '#e05252', fontSize: '0.8rem', marginTop: '0.5vh' }}>{oldPasswordError}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '2vh' }}>
                  <button className="filledcolorbtn cursive-font" onClick={verifyOldPassword} disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('ask')}>← Back</button>
                </div>
              </>
            )}

            {/* CHANGE */}
            {isEditMode && passwordStep === 'change' && (
              <>
                <h3 className="cursive-font" style={{ marginBottom: '3vh' }}>Set New Password</h3>
                <input type="password" value={saltKey} onChange={(e) => setSaltKey(e.target.value)}
                  className="bordercolorbtn cursive-font passWordMng"
                  placeholder="New Password (min. 12 characters)"
                  style={{ textAlign: 'start', width: '100%', height: '8vh' }} />
                <div style={{ fontSize: '0.75rem', marginTop: '0.4vh', marginBottom: '0.6vh' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4vw' }}>
                    {[
                      { label: '12+ chars', ok: saltKey.length >= 12 },
                      { label: 'A-Z', ok: /[A-Z]/.test(saltKey) },
                      { label: 'a-z', ok: /[a-z]/.test(saltKey) },
                      { label: '0-9', ok: /[0-9]/.test(saltKey) },
                      { label: '!@#...', ok: /[^A-Za-z0-9]/.test(saltKey) },
                    ].map(r => (
                      <span key={r.label} className="cursive-font" style={{
                        padding: '0.15rem 0.5rem', borderRadius: '1rem',
                        border: `1px solid ${saltKey.length === 0 ? '#ccc' : r.ok ? '#5a9e6f' : '#e05252'}`,
                        color: saltKey.length === 0 ? '#aaa' : r.ok ? '#5a9e6f' : '#e05252',
                        backgroundColor: saltKey.length === 0 ? 'transparent' : r.ok ? '#edf7f0' : '#fdf0f0',
                      }}>{r.ok ? '✓' : '✗'} {r.label}</span>
                    ))}
                  </div>
                </div>
                <input type="password" value={confirmSaltKey} onChange={(e) => setConfirmSaltKey(e.target.value)}
                  className="bordercolorbtn cursive-font passWordMng" placeholder="Confirm New Password"
                  style={{ textAlign: 'start', width: '100%', height: '8vh' }} />
                <div className="cursive-font" style={{ fontSize: '0.78rem', textAlign: 'right', marginTop: '-0.4vh', marginBottom: '0.8vh',
                  color: confirmSaltKey.length === 0 ? '#aaa' : confirmSaltKey === saltKey ? '#5a9e6f' : '#e05252' }}>
                  {confirmSaltKey.length > 0 ? (confirmSaltKey === saltKey ? '✓ Passwords match' : '✗ Passwords do not match') : ''}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <button className="filledcolorbtn cursive-font" onClick={() => exportData()} disabled={isExporting}>
                    {isExporting ? 'Saving...' : 'Re-Download'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('verify')}>← Back</button>
                </div>
              </>
            )}

            {/* NORMAL */}
            {!isEditMode && (
              <>
                <h3 className="cursive-font" style={{ marginBottom: '4vh' }}>Please Enter Details...</h3>
                <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                  className="bordercolorbtn cursive-font" placeholder="Enter File Name"
                  style={{ textAlign: 'start', width: '100%', height: '8vh', marginBottom: 0 }} />
                <br />
                <input type="password" value={saltKey} onChange={(e) => setSaltKey(e.target.value)}
                  className="bordercolorbtn cursive-font passWordMng"
                  placeholder="Enter Password (min. 12 characters)"
                  style={{ textAlign: 'start', width: '100%', height: '8vh' }} />
                <div style={{ fontSize: '0.75rem', marginTop: '0.4vh', marginBottom: '0.6vh' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4vw' }}>
                    {[
                      { label: '12+ chars', ok: saltKey.length >= 12 },
                      { label: 'A-Z', ok: /[A-Z]/.test(saltKey) },
                      { label: 'a-z', ok: /[a-z]/.test(saltKey) },
                      { label: '0-9', ok: /[0-9]/.test(saltKey) },
                      { label: '!@#...', ok: /[^A-Za-z0-9]/.test(saltKey) },
                    ].map(r => (
                      <span key={r.label} className="cursive-font" style={{
                        padding: '0.15rem 0.5rem', borderRadius: '1rem',
                        border: `1px solid ${saltKey.length === 0 ? '#ccc' : r.ok ? '#5a9e6f' : '#e05252'}`,
                        color: saltKey.length === 0 ? '#aaa' : r.ok ? '#5a9e6f' : '#e05252',
                        backgroundColor: saltKey.length === 0 ? 'transparent' : r.ok ? '#edf7f0' : '#fdf0f0',
                      }}>{r.ok ? '✓' : '✗'} {r.label}</span>
                    ))}
                  </div>
                </div>
                <input type="password" value={confirmSaltKey} onChange={(e) => setConfirmSaltKey(e.target.value)}
                  className="bordercolorbtn cursive-font passWordMng" placeholder="Confirm Password"
                  style={{ textAlign: 'start', width: '100%', height: '8vh' }} />
                <div className="cursive-font" style={{ fontSize: '0.78rem', textAlign: 'right', marginTop: '-0.4vh', marginBottom: '0.8vh',
                  color: confirmSaltKey.length === 0 ? '#aaa' : confirmSaltKey === saltKey ? '#5a9e6f' : '#e05252' }}>
                  {confirmSaltKey.length > 0 ? (confirmSaltKey === saltKey ? '✓ Passwords match' : '✗ Passwords do not match') : ''}
                </div>
                <div className="cursive-font" style={{ fontSize: '0.78rem', color: '#7da2a9', textAlign: 'center', marginBottom: '1.5vh' }}>
                  <SinfoLogo className="sinfo-icon" /> Saves as <strong>.sinfo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <button className="filledcolorbtn cursive-font" onClick={() => exportData()} disabled={isExporting}>
                    {isExporting ? 'Saving...' : 'Download'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setShowModal(false)} disabled={isExporting}>Cancel</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default CreateFile;
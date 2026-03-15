import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import '../styles/CreateFile.css';
import '../Global.css';
import { encryptWithFixedIV, splitter, embedInPng, decryptWithFixedIV } from "./ManageCrypto";
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

// ─── CreateFile ───────────────────────────────────────────────────────────────
function CreateFile() {
  const location = useLocation();
  const editRows = location.state?.editRows as { key: string; value: string }[] | undefined;
  const editFilename = location.state?.editFilename as string | undefined;
  const editPassword = location.state?.editPassword as string | undefined; // old password passed from FileContentPage
  const isEditMode = !!editRows;

  // ── Password strength validator ───────────────────────────────────────────
  const validatePasswordStrength = (pwd: string): string | null => {
    if (pwd.length < 12)           return 'Password must be at least 12 characters.';
    if (!/[A-Z]/.test(pwd))        return 'Password must include at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(pwd))        return 'Password must include at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(pwd))        return 'Password must include at least one number (0-9).';
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must include at least one special character (!@#$%^&*...).';
    return null; // valid
  };

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

  // ── Password change state (edit mode only) ────────────────────────────────
  // 'ask'       — modal asking "keep same or change password?"
  // 'verify'    — ask old password to verify before allowing change
  // 'change'    — show new + confirm password inputs
  // 'keep'      — use old password directly, show only filename input
  type PasswordStep = 'ask' | 'verify' | 'change' | 'keep';
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('ask');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Row helpers ───────────────────────────────────────────────────────────
  const addRow = () => setRows([{ key: '', value: '' }, ...rows]);
  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };
  const confirmRemoveRow = (index: number) => { setSelectedRowIndex(index); setShowPopup(true); };
  const handleRemoveRow = () => {
    if (selectedRowIndex !== null) {
      setRows(rows.filter((_, i) => i !== selectedRowIndex));
      setShowPopup(false);
      setSelectedRowIndex(null);
    }
  };
  const handleCancel = () => { setShowPopup(false); setSelectedRowIndex(null); };

  const confirmPopUp = () => {
    for (const row of rows) {
      if (!row.key.trim() || !row.value.trim()) { alert('Please fill all available rows.'); return; }
    }
    // In edit mode reset password step each time modal opens
    if (isEditMode) setPasswordStep('ask');
    setSaltKey('');
    setConfirmSaltKey('');
    setOldPasswordInput('');
    setOldPasswordError('');
    setShowModal(true);
  };

  // ── Verify old password before allowing change ────────────────────────────
  const verifyOldPassword = async () => {
    if (!oldPasswordInput) { setOldPasswordError('Please enter your old password.'); return; }
    setIsVerifying(true);
    setOldPasswordError('');
    try {
      // Re-encrypt old password with itself and compare — same logic as FileContentPage
      const encrypted = await encryptWithFixedIV(editPassword!, editPassword!);
      const decrypted = await decryptWithFixedIV(encrypted, oldPasswordInput);
      if (decrypted === editPassword) {
        setPasswordStep('change');
      } else {
        // direct compare as fallback
        if (oldPasswordInput === editPassword) {
          setPasswordStep('change');
        } else {
          setOldPasswordError('Incorrect old password. Please try again.');
        }
      }
    } catch {
      // fallback: direct compare
      if (oldPasswordInput === editPassword) {
        setPasswordStep('change');
      } else {
        setOldPasswordError('Incorrect old password. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const exportData = async (passwordOverride?: string) => {
    if (!filename.trim()) { alert('Please enter a file name.'); return; }

    // passwordOverride is passed directly from button click to avoid stale state
    const passwordToUse = passwordOverride ?? (passwordStep === 'change' ? saltKey : editPassword ?? saltKey);

    // Validate password for normal mode AND change password mode
    if (!passwordOverride) {
      const strengthError = validatePasswordStrength(passwordToUse);
      if (strengthError) { alert(strengthError); return; }
      if (passwordStep === 'change' && saltKey !== confirmSaltKey) { alert('Passwords do not match.'); return; }
      if (!isEditMode && saltKey !== confirmSaltKey) { alert('Passwords do not match.'); return; }
    }

    setIsExporting(true);
    try {
      const encryptedLines: string[] = [];
      for (const row of rows) {
        const line = `${row.key}${splitter}${row.value}\n`;
        encryptedLines.push(await encryptWithFixedIV(line, passwordToUse));
      }
      const verificationToken = await encryptWithFixedIV(passwordToUse, passwordToUse);
      const payload = [...encryptedLines, verificationToken].join('\n');
      const pngBlob = await embedInPng(payload);
      const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pngBlob);
      link.download = `${safeFilename}.sinfo`;
      link.click();
      URL.revokeObjectURL(link.href);
      setShowModal(false);
      setSaltKey('');
      setConfirmSaltKey('');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div id="mainCreateDiv">
      <div style={{ marginTop: '3vh', width: '68vw' }}>

        {/* Header bar */}
        <div style={{ marginBottom: '4vh', display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 56 }}>
          <h3 className="cursive-font">
            {isEditMode ? `✏️ Editing — ${editFilename || 'File'}` : 'Please Enter Your Details...'}
          </h3>
          <div>
            <button onClick={addRow} className="filledcolorbtn cursive-font">Add Row</button>
            <button style={{ width: '14vw' }} onClick={confirmPopUp} className="bordercolorbtn cursive-font">
              {isEditMode ? 'Re-Download' : 'Save And Download'}
            </button>
          </div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div key={index} style={{ margin: '10px 0', display: 'flex', alignItems: 'center', marginTop: '5vh' }}>
            <div style={{ marginRight: '10px' }}>
              <input className="bordercolorbtn cursive-font" type="text" value={row.key}
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                placeholder="Enter Header" style={{ width: '20vw', textAlign: 'start' }} />
            </div>
            <div style={{ marginRight: '10px' }}>
              <textarea className="bordercolorbtn cursive-font" value={row.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                placeholder="Enter Data" rows={4} cols={30} style={{ width: '36vw', textAlign: 'start' }} />
            </div>
            <button className="filledcolorbtn cursive-font" onClick={() => confirmRemoveRow(index)}>Remove</button>
            {showPopup && <Popup message="Are you sure you want to remove this row?" onConfirm={handleRemoveRow} onCancel={handleCancel} />}
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ width: '40vw' }}>

            {/* ── STEP: ask — keep or change password (edit mode only) ── */}
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
                  <button className="filledcolorbtn cursive-font" onClick={() => exportData(editPassword!)}>
                    Keep Same Password
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('verify')}>
                    Change Password
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1vh' }}>
                  <button className="bordercolorbtn cursive-font" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </>
            )}

            {/* ── STEP: verify — enter old password ── */}
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
                {oldPasswordError && (
                  <p style={{ color: '#e05252', fontSize: '0.8rem', marginTop: '0.5vh' }}>{oldPasswordError}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '2vh' }}>
                  <button className="filledcolorbtn cursive-font" onClick={verifyOldPassword} disabled={isVerifying}>
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('ask')}>← Back</button>
                </div>
              </>
            )}

            {/* ── STEP: change — new password inputs ── */}
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
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
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
                    {isExporting ? 'Embedding...' : 'Re-Download'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setPasswordStep('verify')}>← Back</button>
                </div>
              </>
            )}

            {/* ── Normal (non-edit) mode — original password + filename flow ── */}
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
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
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
                  <SinfoLogo className="sinfo-icon" /> Saves as <strong>.sinfo</strong> — encrypted data embedded inside an image
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <button className="filledcolorbtn cursive-font" onClick={() => exportData()} disabled={isExporting}>
                    {isExporting ? 'Embedding...' : 'Download'}
                  </button>
                  <button className="bordercolorbtn cursive-font" onClick={() => setShowModal(false)} disabled={isExporting}>
                    Cancel
                  </button>
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
// ManageCrypto.tsx — Web Crypto API (AES-GCM + PBKDF2) + Base64 encoding
// Replaced PNG steganography with Base64 to avoid Brave/Firefox canvas
// fingerprinting protection corrupting pixel data.

export const splitter = '¦';

// .sinfo file format:
//   Line 1:    SINFO:1                          ← magic header + version
//   Line 2..N: <encrypted entry (base64)>       ← one per row
//   Last line: <verification token (base64)>    ← password check
//
// The entire content is then Base64-encoded before saving so it looks
// like random gibberish in any text editor.

export const SINFO_MAGIC = 'SINFO:1';

// ─── Key Derivation ───────────────────────────────────────────────────────────
const deriveKey = async (password: string): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const saltBytes = enc.encode(password.split('').reverse().join('') + password);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

// ─── Encrypt ──────────────────────────────────────────────────────────────────
export const encryptWithFixedIV = async (
  text: string,
  password: string,
  _ivString?: string
): Promise<string> => {
  const enc = new TextEncoder();
  const key = await deriveKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, enc.encode(text)
  );
  return `${bufferToBase64(iv.buffer)}:${bufferToBase64(cipherBuffer)}`;
};

// ─── Decrypt ──────────────────────────────────────────────────────────────────
export const decryptWithFixedIV = async (
  encryptedText: string,
  password: string,
  _ivString?: string
): Promise<string> => {
  const [ivBase64, cipherBase64] = encryptedText.split(':');
  if (!ivBase64 || !cipherBase64) return '';
  const key = await deriveKey(password);
  const iv = new Uint8Array(base64ToBuffer(ivBase64));
  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, key, base64ToBuffer(cipherBase64)
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    return '';
  }
};

// ─── Embed — Build .sinfo file content ───────────────────────────────────────
// Takes the assembled payload (encrypted lines joined by \n) and wraps it
// with a magic header, then Base64-encodes the whole thing.
// The result is a string that looks like random gibberish — saved as .sinfo.
export const embedInSinfo = (payload: string): Blob => {
  const content = `${SINFO_MAGIC}\n${payload}`;
  // Base64-encode the entire content so it looks like gibberish in any editor
  const encoded = window.btoa(unescape(encodeURIComponent(content)));
  return new Blob([encoded], { type: 'application/octet-stream' });
};

// ─── Extract — Read .sinfo file content ──────────────────────────────────────
// Reads the file as text, Base64-decodes it, verifies the magic header,
// and returns the raw payload string for decryption.
export const extractFromSinfo = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const raw = new TextDecoder().decode(arrayBuffer).trim();

  let decoded: string;
  try {
    decoded = decodeURIComponent(escape(window.atob(raw)));
  } catch {
    throw new Error('Invalid .sinfo file — could not decode content.');
  }

  if (!decoded.startsWith(SINFO_MAGIC)) {
    throw new Error('Invalid .sinfo file — missing header.');
  }

  // Strip the magic header line and return the payload
  return decoded.slice(SINFO_MAGIC.length + 1); // +1 for \n
};
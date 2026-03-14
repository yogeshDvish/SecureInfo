// ManageCrypto.tsx — Web Crypto API (AES-GCM + PBKDF2) + PNG Steganography

export const splitter = '¦';

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
const bufferToBase64 = (buffer: ArrayBuffer): string => {
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

// ─── PNG Steganography — Embed ────────────────────────────────────────────────
// Embeds the encrypted text payload into the LSB (least significant bit) of
// the red channel of each pixel in a canvas. The canvas is then exported as
// a PNG blob and saved with a .sinfo extension.
//
// File structure stored in pixels:
//   [0..3]   4 pixels  — payload length as 32-bit big-endian integer (1 bit per pixel)
//   [4..N]   N pixels  — payload bits (1 bit per pixel, LSB of red channel)
//
// A 200×200 canvas = 40,000 pixels = 40,000 bits = 5,000 bytes capacity.
// Typical encrypted payload is well under 4,000 bytes.

export const embedInPng = (payload: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    // Fixed canvas size — large enough for any reasonable payload
    const SIZE = 300;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d')!;

    // Fill with a neutral grey background so the image looks intentional
    ctx.fillStyle = '#e8f0f1';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Draw a subtle pattern so it doesn't look like a blank image
    ctx.fillStyle = '#d0dfe2';
    for (let i = 0; i < SIZE; i += 20) {
      ctx.fillRect(i, 0, 1, SIZE);
      ctx.fillRect(0, i, SIZE, 1);
    }

    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const pixels = imageData.data; // RGBA flat array

    // Convert payload string → binary bit string
    const payloadBytes = new TextEncoder().encode(payload);
    const payloadLength = payloadBytes.length;

    // Check capacity: need 32 bits for length header + 8 bits per payload byte
    const bitsNeeded = 32 + payloadLength * 8;
    const bitsAvailable = SIZE * SIZE; // 1 bit per pixel (LSB of red channel)
    if (bitsNeeded > bitsAvailable) {
      reject(new Error(`Payload too large: needs ${bitsNeeded} bits, canvas has ${bitsAvailable}`));
      return;
    }

    // Helper: write one bit into pixel[pixelIndex] red channel LSB
    const writeBit = (pixelIndex: number, bit: number) => {
      const byteIndex = pixelIndex * 4; // R is at [byteIndex], G at +1, B at +2, A at +3
      pixels[byteIndex] = (pixels[byteIndex] & 0xFE) | (bit & 1);
    };

    // Write 32-bit length header (big-endian)
    for (let i = 0; i < 32; i++) {
      const bit = (payloadLength >> (31 - i)) & 1;
      writeBit(i, bit);
    }

    // Write payload bits
    let pixelIndex = 32;
    for (let byteIdx = 0; byteIdx < payloadLength; byteIdx++) {
      for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
        const bit = (payloadBytes[byteIdx] >> bitIdx) & 1;
        writeBit(pixelIndex++, bit);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create PNG blob'));
    }, 'image/png');
  });
};

// ─── PNG Steganography — Extract ──────────────────────────────────────────────
// Reads the LSB of the red channel of each pixel to reconstruct the payload.
// Accepts the raw ArrayBuffer of the .sinfo file (which is a valid PNG).

export const extractFromPng = (arrayBuffer: ArrayBuffer): string => {
  // Parse PNG manually to extract pixel data without a canvas
  // We use an OffscreenCanvas or a regular canvas via a Blob URL
  // Since this runs synchronously in our flow we return a Promise instead
  throw new Error('Use extractFromPngAsync instead');
};

export const extractFromPngAsync = (arrayBuffer: ArrayBuffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;

      const readBit = (pixelIndex: number): number => {
        return pixels[pixelIndex * 4] & 1; // LSB of red channel
      };

      // Read 32-bit length header
      let payloadLength = 0;
      for (let i = 0; i < 32; i++) {
        payloadLength = (payloadLength << 1) | readBit(i);
      }

      if (payloadLength <= 0 || payloadLength > 100_000) {
        reject(new Error('Invalid or corrupted .sinfo file'));
        return;
      }

      // Read payload bytes
      const payloadBytes = new Uint8Array(payloadLength);
      let pixelIndex = 32;
      for (let byteIdx = 0; byteIdx < payloadLength; byteIdx++) {
        let byte = 0;
        for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
          byte |= (readBit(pixelIndex++) << bitIdx);
        }
        payloadBytes[byteIdx] = byte;
      }

      resolve(new TextDecoder().decode(payloadBytes));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from .sinfo file'));
    };

    img.src = url;
  });
};
import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { secureInfoModel } from "../models/SecureInfoModel";


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
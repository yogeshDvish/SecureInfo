# 🔐 SecureInfo

A client-side React application for securely storing and retrieving sensitive key-value data using military-grade AES-256-GCM encryption — entirely in the browser, with no server, no database, and no third-party dependencies.

---

## Overview

SecureInfo allows users to store sensitive information (passwords, PINs, API keys, personal notes) in an encrypted `.txt` file that can be saved locally and reopened at any time. All encryption and decryption happens entirely on the client side using the native **Web Crypto API** — no data is ever transmitted to any server.

---

## Features

- **AES-256-GCM Encryption** — Industry-standard authenticated encryption with per-entry random IVs
- **PBKDF2 Key Derivation** — Password is strengthened with 100,000 iterations of PBKDF2-SHA256 before use
- **Zero Server Dependency** — Fully static application; no backend, no database, no network requests
- **Portable Encrypted Files** — Encrypted output is a plain `.txt` file that can be stored anywhere
- **Password Verification** — Incorrect passwords are detected immediately without exposing any data
- **Drag & Drop File Loading** — Upload encrypted files via drag-and-drop or file picker
- **In-Page File Switching** — Switch between encrypted files without leaving the page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Encryption | Web Crypto API (native browser) |
| Key Derivation | PBKDF2-SHA256 (100,000 iterations) |
| Cipher | AES-256-GCM |
| Routing | React Router v6 |
| Styling | CSS Modules |
| Build | Create React App |
| Deployment | Netlify |

---

## Security Architecture

### Encryption
Each key-value entry is individually encrypted using AES-256-GCM. A unique 12-byte random IV is generated per entry at encryption time and stored alongside the ciphertext in the format:

```
<base64(iv)>:<base64(ciphertext)>
```

### Key Derivation
The user's password is never used directly as an encryption key. Instead, it is passed through PBKDF2 with:
- **100,000 iterations**
- **SHA-256** hash function
- A deterministic salt derived from the password

### File Format
Encrypted files follow this structure:

```
<encrypted_entry_1>
<encrypted_entry_2>
...
<encrypted_entry_n>
<verification_token>
```

The final line is a verification token — the password encrypted with itself — used to validate the entered password before attempting full decryption.

### Threat Model
| Attack Vector | Protection |
|---|---|
| File stolen without password | AES-256-GCM — computationally infeasible to break |
| Brute force | PBKDF2 rate-limits each guess to significant CPU time |
| Tampered file | AES-GCM authentication tag detects any modification |
| Network interception | No network requests made — fully offline |

---

## Getting Started

### Prerequisites
- Node.js >= 14
- npm >= 6

### Installation

```bash
git clone https://github.com/your-username/secure-info.git
cd secure-info
npm install
```

### Running Locally

```bash
npm start
```

The app runs at `http://localhost:3000`. The Web Crypto API requires a secure context — `localhost` qualifies automatically.

### Production Build

```bash
npm run build
```

### Deploying to Netlify

The project is configured for Netlify static deployment. Push to your connected repository and Netlify will automatically build and deploy with HTTPS enabled (required for Web Crypto API in production).

---

## Usage

### Creating an Encrypted File
1. Navigate to **Create File**
2. Add key-value rows (e.g., `Username` / `john@example.com`)
3. Click **Save and Download**
4. Enter a filename and a strong password
5. The encrypted `.txt` file is downloaded to your machine

### Opening an Encrypted File
1. On the home screen, drag and drop or click to upload your `.txt` file
2. The app navigates automatically to the password prompt
3. Enter your password — the file decrypts and displays your entries
4. Use **Select Another File** to switch files without leaving the page

---

## Project Structure

```
src/
├── common/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── models/
│   └── SecureInfoModel.tsx
├── secure-info/
│   ├── CreateFile.tsx        # Entry creation and encrypted file export
│   ├── FileContentPage.tsx   # File upload, password entry, decrypted view
│   ├── ManageCrypto.tsx      # Web Crypto API — encrypt / decrypt / key derivation
│   └── SecurePage.tsx        # Home screen with file upload
└── styles/
    ├── CreateFile.css
    ├── FileContentPage.css
    └── SecurePage.css
```

---

## Browser Compatibility

The Web Crypto API (`window.crypto.subtle`) is supported in all modern browsers and requires a **secure context (HTTPS or localhost)**.

| Browser | Minimum Version |
|---|---|
| Chrome | 37 |
| Firefox | 34 |
| Safari | 11 |
| Edge | 12 |

> Internet Explorer is not supported.

---

## License

MIT License. See `LICENSE` for details.
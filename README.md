# 🔐 SecureInfo

A client-side React application for securely storing and retrieving sensitive key-value data using military-grade AES-256-GCM encryption — entirely in the browser, with no server, no database, and no third-party crypto dependencies.

**Live:** [secure-info.netlify.app](https://secure-info.netlify.app)

---

## Overview

SecureInfo allows users to store sensitive information (passwords, PINs, API keys, personal notes) in an encrypted `.sinfo` file that can be saved locally and reopened at any time. All encryption and decryption happens entirely in the browser using the native **Web Crypto API** — no data is ever transmitted to any server.

---

## Features

- **AES-256-GCM Encryption** — Industry-standard authenticated encryption with per-entry random IVs
- **PBKDF2 Key Derivation** — Password strengthened with 100,000 iterations of PBKDF2-SHA256
- **Password Strength Enforcement** — Minimum 12 characters with uppercase, lowercase, numbers, and special characters enforced with live feedback
- **Custom `.sinfo` Format** — Encrypted payload is Base64-encoded and saved with a custom extension unrecognised by any OS or editor
- **Tamper Detection** — AES-GCM authentication tag automatically rejects any modified file
- **Edit & Re-Download** — Open any `.sinfo` file, edit entries, and re-download with the same or a new password
- **Password Change Flow** — Change password requires verifying the old password first
- **Zero Server Dependency** — Fully static; no backend, no database, no network requests
- **Drag & Drop File Loading** — Upload `.sinfo` files via drag-and-drop or file picker
- **Responsive UI** — Works on desktop, tablet, and mobile
- **Deployed on Netlify** — Automatic HTTPS, required for Web Crypto API in production

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Encryption | Web Crypto API (native browser) |
| Key Derivation | PBKDF2-SHA256 (100,000 iterations) |
| Cipher | AES-256-GCM |
| Routing | React Router v6 (HashRouter) |
| Styling | CSS + Bootstrap 5 |
| Build | Create React App |
| Deployment | Netlify |

---

## Security Architecture

### Encryption
Each key-value entry is individually encrypted using AES-256-GCM. A unique random 12-byte IV is generated per encryption call and stored alongside the ciphertext:

```
<base64(iv)>:<base64(ciphertext)>
```

### Key Derivation
The password is never used directly as an AES key. It is processed through PBKDF2:
- **100,000 iterations**
- **SHA-256** hash function
- Deterministic salt derived from the password

### File Format
The `.sinfo` file is a Base64-encoded string containing:

```
SINFO:1                    ← magic header + version
<encrypted_entry_1>        ← key¦value encrypted
<encrypted_entry_2>
...
<verification_token>       ← password encrypted with itself
```

The entire content is Base64-encoded before saving — it looks like random gibberish in any text editor.

### Password Requirements
All passwords must contain:
- At least 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%...)

### Threat Model
| Attack Vector | Protection |
|---|---|
| File stolen without password | AES-256-GCM — computationally infeasible to break |
| Brute force | PBKDF2 100k iterations rate-limits each guess |
| File tampered | AES-GCM auth tag detects any modification |
| Network interception | No network requests — fully offline |
| Canvas fingerprinting (Brave) | Base64 format — no canvas/pixel dependency |

---

## Getting Started

### Prerequisites
- Node.js >= 14
- npm >= 6

### Installation

```bash
git clone https://github.com/yogeshDvish/SecureInfo.git
cd SecureInfo
npm install
```

### Running Locally

```bash
npm start
```

The app runs at `http://localhost:3000`. Web Crypto API works on localhost automatically.

### Production Build

```bash
npm run build
```

Always run this before pushing to catch any ESLint or TypeScript errors locally before Netlify does.

---

## Usage

### Creating an Encrypted File
1. Click **Create File** on the home screen
2. Add key-value rows (e.g. `Username` / `john@example.com`)
3. Click **Save & Download**
4. Enter a filename and a strong password (live strength indicator shown)
5. The encrypted `.sinfo` file downloads to your machine

### Opening an Encrypted File
1. Drag and drop or click to upload your `.sinfo` file on the home screen
2. The app navigates automatically to the password prompt showing the filename
3. Enter your password — the file decrypts and displays your entries
4. Use **Select Another File** to switch files without leaving the page

### Editing an Encrypted File
1. Open your `.sinfo` file and enter your password
2. Click **✏️ Edit** in the top bar
3. All entries are pre-filled — add, remove, or modify rows
4. Click **Re-Download**
5. Choose **Keep Same Password** or **Change Password**
6. If changing — verify your old password first, then set the new one

---

## Project Structure

```
src/
├── assets/
│   └── logo.svg                  # App logo (also used as favicon)
├── common/
│   └── Navbar.tsx                # Responsive navbar with active link detection
├── secure-info/
│   ├── About.tsx                 # About page with FAQ accordion + author card
│   ├── CreateFile.tsx            # Entry editor, password validation, .sinfo export
│   ├── FileContentPage.tsx       # File upload, password entry, decrypted view, edit
│   ├── ManageCrypto.tsx          # Web Crypto API — encrypt / decrypt / Base64 embed
│   └── SecurePage.tsx            # Home screen with drag-and-drop file upload
├── styles/
│   ├── About.css
│   ├── FileContentPage.css
│   └── SecurePage.css
├── App.tsx                       # Router setup (HashRouter)
└── Global.css                    # Theme variables and shared button styles
```

---

## Browser Compatibility

The Web Crypto API requires a **secure context (HTTPS or localhost)**. Netlify provides HTTPS automatically.

| Browser | Support |
|---|---|
| Chrome | ✅ v37+ |
| Firefox | ✅ v34+ |
| Safari | ✅ v11+ |
| Edge | ✅ v12+ |
| Brave | ✅ Full support (Base64 format avoids canvas fingerprinting issues) |
| Internet Explorer | ❌ Not supported |

---

## License

MIT License. See `LICENSE` for details.
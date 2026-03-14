import React, { useState } from 'react';
import '../Global.css';
import '../styles/About.css';
import { ReactComponent as Logo } from '../assets/logo.svg';

const sections = [
  {
    icon: '🔐',
    title: 'What is SecureInfo?',
    content:
      'SecureInfo is a client-side encrypted data storage application. It allows you to store sensitive key-value data — passwords, PINs, API keys, private notes — in a portable encrypted file that only you can open. No servers. No databases. No accounts. Files are saved with a custom .sinfo extension that no OS or editor can recognise by default.',
  },
  {
    icon: '⚙️',
    title: 'How does encryption work?',
    content:
      'Every entry is encrypted individually using AES-256-GCM — the same cipher used by governments and financial institutions. Your password is never stored. It is processed through PBKDF2 with 100,000 iterations to derive a 256-bit encryption key. A unique random 12-byte IV is generated per entry using the native Web Crypto API, ensuring identical inputs never produce identical ciphertext. The AES-GCM authentication tag detects and rejects any file modification automatically.',
  },
  {
    icon: '🖼️',
    title: 'What is the .sinfo file?',
    content:
      'When you create a file, SecureInfo downloads a .sinfo file to your device. Internally it is a valid PNG image — your encrypted data is invisibly embedded into the pixel data using steganography (LSB encoding on the red channel). Opening it in any image viewer shows a plain grid image. Opening it in a text editor shows unreadable binary. Only the SecureInfo app knows how to extract and decrypt the hidden data.',
  },
  {
    icon: '🛡️',
    title: 'How is the file protected from tampering?',
    content:
      'Three layers protect the file. First, the .sinfo extension means no application opens it by default. Second, PNG binary format means text editors show only noise even if the file is renamed. Third, AES-256-GCM authentication — if even a single pixel is modified, decryption fails entirely and no data is exposed.',
  },
  {
    icon: '✏️',
    title: 'Can I edit my file after saving?',
    content:
      'Yes. Open your .sinfo file, enter your password, and click the Edit button in the top bar. You will be taken back to the editor with all your entries pre-filled. After editing, click Re-Download. You can keep the same password or set a new one — if you choose to change it, you will be asked to verify the old password first.',
  },
  {
    icon: '🌐',
    title: 'Does anything leave my device?',
    content:
      'No. All encryption, decryption, steganography, and key derivation happen entirely in your browser using the native Web Crypto API and Canvas API. No data is transmitted to any server. SecureInfo has no backend, no analytics, and makes zero network requests.',
  },
  {
    icon: '🔑',
    title: 'What protects against brute force?',
    content:
      'PBKDF2 with 100,000 iterations makes each password guess computationally expensive — limiting an attacker to a handful of attempts per second even on high-end hardware. SecureInfo enforces a minimum password length of 12 characters and shows a live counter and match indicator while you type.',
  },
  {
    icon: '💡',
    title: 'What makes a strong password?',
    content:
      'Use at least 12 characters combining uppercase, lowercase, numbers, and symbols. Avoid dictionary words, names, or dates. The security of your .sinfo file is entirely dependent on your password strength — the AES-256-GCM encryption itself is computationally unbreakable.',
  },
];

const author = {
  name: 'Yogesh Vishwakarma',
  github: { label: 'yogeshDvish', url: 'https://github.com/yogeshDvish' },
  linkedin: { label: 'vishwakarmayogesh', url: 'https://www.linkedin.com/in/vishwakarmayogesh' },
  portfolio: { label: 'techportfolioyogesh.netlify.app', url: 'https://techportfolioyogesh.netlify.app/' },
};

function About() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div id="aboutPage">

      {/* ── Header ── */}
      <div id="aboutHeader">
        <h1 className="cursive-font">About SecureInfo</h1>
        <p className="about-subtitle">
          Military-grade encryption. Zero servers. Hidden in plain sight.
        </p>
      </div>

      {/* ── Tech badges ── */}
      <div id="aboutBadges">
        {[
          'AES-256-GCM',
          'PBKDF2 · 100k iterations',
          'Web Crypto API',
          'PNG Steganography',
          '.sinfo format',
          'Zero Server',
          'React + TypeScript',
        ].map((badge) => (
          <span key={badge} className="about-badge cursive-font">{badge}</span>
        ))}
      </div>

      {/* ── Accordion FAQ ── */}
      <div id="aboutAccordion">
        {sections.map((s, i) => (
          <div
            key={i}
            className={`accordion-item ${openIndex === i ? 'open' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="accordion-header">
              <span className="accordion-icon">{s.icon}</span>
              <span className="accordion-title cursive-font">{s.title}</span>
              <span className="accordion-chevron">{openIndex === i ? '▲' : '▼'}</span>
            </div>
            {openIndex === i && (
              <div className="accordion-body cursive-font">{s.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* ── Author card ── */}
      <div id="authorCard">
        <div id="authorInfo">
          {/* Logo used as profile picture */}
          <div className="author-avatar-logo">
            <Logo />
          </div>
          <div>
            <p className="author-name cursive-font">{author.name}</p>
            <p className="author-role cursive-font">Developer · SecureInfo</p>
          </div>
        </div>

        <div id="authorLinks">
          <a href={author.github.url} target="_blank" rel="noreferrer" className="author-link cursive-font">
            <span>🐙</span> {author.github.label}
          </a>
          <a href={author.linkedin.url} target="_blank" rel="noreferrer" className="author-link cursive-font">
            <span>💼</span> {author.linkedin.label}
          </a>
          <a href={author.portfolio.url} target="_blank" rel="noreferrer" className="author-link cursive-font">
            <span>🌐</span> {author.portfolio.label}
          </a>
        </div>
      </div>

      {/* ── Bottom note ── */}
      <p className="about-note cursive-font">
        SecureInfo is open source. Your data belongs to you — always.
      </p>

    </div>
  );
}

export default About;
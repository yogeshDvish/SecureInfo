// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg main-color" style={{position:'sticky', top: 0}}>
      <div className="container-fluid main-color">
        <Link className="navbar-brand main-color cursive-font" to="/">
          Secure Info
        </Link>
        <button
          className="navbar-toggler main-color"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon main-color"></span>
        </button>
        <div className="collapse navbar-collapse main-color" id="navbarNav">
          <ul className="navbar-nav main-color">
            <li className="nav-item main-color">
              <Link className="nav-link active cursive-font" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item main-color">
              <Link className="nav-link cursive-font" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item main-color">
              <Link className="nav-link cursive-font" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

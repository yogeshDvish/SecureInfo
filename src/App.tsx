import React from 'react';
import Navbar from './common/Navbar';
import SecurePage from './secure-info/SecurePage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateFile from './secure-info/CreateFile';
import FileContentPage from './secure-info/FileContentPage';


function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<SecurePage />} /> 
        <Route path="/create-file" element={<CreateFile />} />
        <Route path="/file-content" element={<FileContentPage />} />
      </Routes>
  </Router>    
  );
}

export default App;

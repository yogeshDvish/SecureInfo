import React, { useState } from 'react';
import '../styles/SecurePage.css';
import '../Global.css';
import { useNavigate } from 'react-router-dom';

function SecurePage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateFileClick = () => navigate('/create-file');

  const navigateToFileContent = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.sinfo')) {
      alert('Invalid file type. Please upload a .sinfo file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      navigate('/file-content', {
        state: { fileName: file.name, fileBuffer: e.target?.result, fileContent: '' }
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) navigateToFileContent(selectedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) navigateToFileContent(droppedFile);
  };

  return (
    <>
      <div id="mainDiv">
        <div>
          <button
            className="main-color filledcolorbtn cursive-font"
            id="createbtn"
            type="button"
            onClick={handleCreateFileClick}
          >
            Create File
          </button>
        </div>

        <div id="uploadWrapper">
          <div
            className={`cursive-font bordercolorbtn ${isDragging ? 'dragging' : ''}`}
            id="uploadMain"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.getElementById('fileInput') as HTMLInputElement;
              if (input) { input.value = ''; input.click(); }
            }}
          >
            <p style={{ margin: 0 }}>Drag/Drop or Upload File Here</p>
            <input
              id="fileInput"
              type="file"
              accept=".sinfo"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default SecurePage;
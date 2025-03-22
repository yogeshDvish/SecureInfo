import React, { useState } from 'react';
import '../styles/SecurePage.css';
import '../Global.css';
import { useNavigate } from 'react-router-dom';

function SecurePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateFileClick = () => {
    navigate('/create-file');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name); 
      readFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      readFile(droppedFile);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleShowContent = () => {
    navigate('/file-content', {
      state: { fileName, fileContent }
    });
  };

  return (
    <>
      <div id="mainDiv">
        <div>
          <div>
            <button
              className="main-color filledcolorbtn"
              id="createbtn"
              type="button"
              onClick={handleCreateFileClick}
            >
              <span className="main-color cursive-font">Create File</span>
            </button>
          </div>
        </div>

        <div>
          <div
            className={`cursive-font bordercolorbtn upload-area ${isDragging ? 'dragging' : ''}`}
            id="uploadMain"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <p>Drag/Drop or Upload File Here</p>

            <input
              id="fileInput"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          {fileName && (
            <div className="file-name-display">
              <h4>Selected File: {fileName}</h4>
              <button onClick={handleShowContent}>Show Content</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SecurePage;

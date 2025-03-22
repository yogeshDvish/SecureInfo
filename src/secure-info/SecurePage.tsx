import React, { useState } from 'react';
import '../styles/SecurePage.css';
import '../Global.css';
import { useNavigate } from 'react-router-dom';

function SecurePage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string | null>(null); // To store the file name
  const [fileContent, setFileContent] = useState<string | null>(null); // To store the file content
  const [isDragging, setIsDragging] = useState(false);

  // Navigate to create file page
  const handleCreateFileClick = () => {
    navigate('/create-file');
  };

  // Handle when a file is selected via the file input dialog
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name); // Set the selected file's name
      readFile(selectedFile);
    }
  };

  // Handle drag over to change style for drag-and-drop effect
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Handle when the file is dropped
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFileName(droppedFile.name); // Set the dropped file's name
      readFile(droppedFile);
    }
  };

  // Read the file's content
  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file); // Assuming the file is a text file
  };

  // Navigate to the file content page and pass the file data
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

        {/* Drag/Drop File Area */}
        <div>
          <div
            className={`cursive-font bordercolorbtn upload-area ${isDragging ? 'dragging' : ''}`}
            id="uploadMain"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <p>Drag/Drop or Upload File Here</p>

            {/* Hidden file input */}
            <input
              id="fileInput"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          {/* Display the file name after selection */}
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

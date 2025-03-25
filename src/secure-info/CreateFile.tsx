import React, { useState } from "react";
import '../styles/CreateFile.css';
import '../Global.css';
import { encryptWithFixedIV, splitter } from "./ManageCrypto";
import { secureInfoModel } from "../models/SecureInfoModel";


const Popup: React.FC<{ message: string, onConfirm: () => void, onCancel: () => void }> = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={{
      height: '100%',
      width: '100%',
      backgroundColor:'rgba(78, 78, 78, 0.15)',
      position: 'fixed',
      top:0,
      left: 0
      }}>
      <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        borderRadius: '1rem',
        color: 'black',
        textAlign: 'center',
        zIndex: 1000,
        border: '.2rem solid #7da2a9',
        backgroundColor: '#f7f7f7',
        height: '24vh'
      }}
    >
      <div style={{marginBottom: '4vh'}}>{message}</div>
      <button
        style={{ margin: '10px', padding: '5px 10px' }}
        className="filledcolorbtn"
        onClick={onConfirm}
      >
        Yes
      </button>
      <button
        style={{ margin: '10px', padding: '5px 10px' }}
        className="bordercolorbtn"
        onClick={onCancel}
      >
        No
      </button>
    </div>
    </div>
  );
};


function CreateFile() {
  const [rows, setRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState("");
  const [saltKey, setSaltKey] = useState<string>('');
  const [confirmSaltKey, setConfirmSaltKey] = useState<string>('');
  const [iv, setIv] = useState<string>(secureInfoModel.iv);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const addRow = () => {
    setRows([{ key: "", value: "" }, ...rows]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleChange = (index: number, field: "key" | "value", value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const confirmPopUp = () => {
    setShowModal(true);
  };

  const exportData = () => {    

    if(saltKey === confirmSaltKey && saltKey.length > 0){
    let encryptedContent = '';
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const line = `${row.key}${splitter}${row.value}\n`;
      encryptedContent += encryptWithFixedIV(line, saltKey, iv)+'\n';
    }
    const encryptedSaltKey = encryptWithFixedIV(saltKey, saltKey, iv);
     const fileContent = `${encryptedContent}${encryptedSaltKey}`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();
    setShowModal(false);
  }
  else{
    alert('Password and Confirm password are not matched.');
  }
  };

  const managePasswordAndIv = (e : React.ChangeEvent<HTMLInputElement>, isConfirmPassword: boolean) => {

    const value = e.target.value;

    if (isConfirmPassword) {
      setConfirmSaltKey(value);
    } else {
      setSaltKey(value);
    }

    // Check if the passwords match
    if (saltKey === confirmSaltKey && saltKey.length > 0) {
      const val = e.target.value;
    const newVal = val.split('').reverse().join('');
    const ivStr = newVal+newVal;
        
    setIv(ivStr);
    secureInfoModel.iv = ivStr; 
    }  
    else{
        // make  this class border red passWordMng
    }   
  }

  const confirmRemoveRow = (index: number) => {
    setSelectedRowIndex(index);
    setShowPopup(true);  // Show the popup when the "Remove" button is clicked
  };

  const handleRemoveRow = () => {
    if (selectedRowIndex !== null) {
      const updatedRows = rows.filter((_, index) => index !== selectedRowIndex);
      setRows(updatedRows);
      setShowPopup(false);  // Close the popup after confirming
      setSelectedRowIndex(null); // Reset selected row index
    }
  };

  const handleCancel = () => {
    setShowPopup(false); // Simply close the popup
    setSelectedRowIndex(null); // Reset selected row index
  };

  return (
    <div id="mainCreateDiv">
      <div style={{ marginTop: "3vh", width: "68vw" }}>
        <div style={{marginBottom: "4vh", display: "flex", justifyContent: "space-between", position: 'sticky', top: 56 }}>
          <h3 className="cursive-font">Please Enter Your Details...</h3>
          <div style={{ float: "right" }}>
            <button onClick={addRow} className="filledcolorbtn cursive-font">Add Row</button>
            <button style={{width:'14vw'}} onClick={confirmPopUp} className="bordercolorbtn cursive-font">Save And Download</button>
          </div>
        </div>

        {rows.map((row, index) => (
          <div key={index} style={{ margin: "10px 0", display: "flex", alignItems: "center", marginTop: "5vh" }}>
            <div style={{ marginRight: "10px" }}>
              <input
                className="bordercolorbtn cursive-font"
                type="text"
                value={row.key}
                onChange={(e) => handleChange(index, "key", e.target.value)}
                placeholder="Enter Header"
                style={{ width: "20vw", textAlign: "start" }}
              />
            </div>
            <div style={{ marginRight: "10px" }}>
              <textarea
                className="bordercolorbtn cursive-font"
                value={row.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                placeholder="Enter Data"
                rows={4}
                cols={30}
                style={{ width: "36vw", textAlign: "start" , height: "" }}
              />
            </div>
            {/* <button className="filledcolorbtn cursive-font" onClick={() => removeRow(index)}>Remove</button> */}
            <button className="filledcolorbtn cursive-font" onClick={() => confirmRemoveRow(index)}>Remove</button>

            {/* Popup (Only shows when showPopup is true) */}
      {showPopup && (
        <Popup
          message="Are you sure you want to remove this row?"
          onConfirm={handleRemoveRow}
          onCancel={handleCancel}
        />
      )}
          </div>
        ))}
      </div>

      {/* Modal for filename, saltkey, and password */}
      {showModal && (
        <div className="modal">
          <div className="modal-content"  style={{width: '40vw'}}>
            <h3 className="cursive-font" style={{marginBottom: '4vh'}}>Please Enter Details...</h3>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                required
                className="bordercolorbtn cursive-font"
                placeholder="Enter File Name"
                style={{ textAlign: "start" ,width:'100%', height: '8vh', marginBottom: '0'}}
              />
            <br />
              <input
                type="password"
                value={saltKey}
                onChange={(e) => managePasswordAndIv(e, false)}
                required
                className="bordercolorbtn cursive-font passWordMng"
                placeholder="Enter Password"
                style={{ textAlign: "start" ,width:'100%', height: '8vh'}}
              />
              <br />
              <input
                type="password"
                value={confirmSaltKey}
                onChange={(e) => managePasswordAndIv(e, true)}
                required
                className="bordercolorbtn cursive-font passWordMng"
                placeholder="Confirm Password"
                style={{ textAlign: "start" ,width:'100%', height: '8vh'}}
              />
            <div style={{display: "flex", justifyContent: "space-evenly"}}>
            <button className="filledcolorbtn cursive-font" onClick={exportData}>Export</button>
            <button className="bordercolorbtn cursive-font" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default CreateFile;
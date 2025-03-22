import React, { useState } from "react";
import '../styles/CreateFile.css';
import '../Global.css';
import { encryptWithFixedIV, splitter } from "./ManageCrypto";
import { secureInfoModel } from "../models/SecureInfoModel";

function CreateFile() {
  const [rows, setRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState("");
  const [saltKey, setSaltKey] = useState<string>('');
  const [iv, setIv] = useState<string>(secureInfoModel.iv);

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
  };

  const manageSaltKeyAndIv = (e : React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newVal = val.split('').reverse().join('');
    const ivStr = newVal+newVal;
    
    setSaltKey(val);
    
    setIv(ivStr);
    secureInfoModel.iv = ivStr;  
  }

  return (
    <div id="mainCreateDiv">
      <div style={{ marginTop: "3vh", width: "68vw" }}>
        <div style={{ marginBottom: "4vh", display: "flex", justifyContent: "space-between" }}>
          <h3 className="cursive-font">Fill Below fields...</h3>
          <div style={{ float: "right" }}>
            <button onClick={addRow} className="filledcolorbtn cursive-font">Add Row</button>
            <button onClick={confirmPopUp} className="bordercolorbtn cursive-font">Export</button>
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
                style={{ width: "40vh", textAlign: "start" }}
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
                style={{ width: "80vh", textAlign: "start" }}
              />
            </div>
            <button className="filledcolorbtn cursive-font" onClick={() => removeRow(index)}>Remove</button>
          </div>
        ))}
      </div>

      {/* Modal for filename, saltkey, and password */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Export Details</h2>
            <label>
              Filename:
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Password:
              {/* <input
                type="text"
                value={saltkey}
                onChange={(e) => setSaltkey(e.target.value)}
                required
              /> */}
              <input
                type="text"
                value={saltKey}
                onChange={(e) => manageSaltKeyAndIv(e)}
                required
              />
            </label>
            <button onClick={exportData}>Export</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}



export default CreateFile;
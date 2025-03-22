import React, { useState } from "react"; // Import the encrypt function
import '../styles/CreateFile.css';
import '../Global.css';
import { encryptWithFixedIV, splitter } from "./ManageCrypto";

function CreateFile() {
  const [rows, setRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState("");
  const [saltkey, setSaltkey] = useState("");
  const [ivString, setIvString] = useState("0000000000000000"); // New state for custom IV string

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
    // Create the content from rows, formatted with each row on a new line
    // const content = rows
    //   .map((row) => `Key: ${row.key}\nValue: ${row.value}\n`) // Format the content for each row
    //   .join("\n"); // Join all rows with an additional newline for separation

    // Encrypt the combined content using the dynamic IV and saltkey
    // const encryptedContent = encryptWithFixedIV(content, saltkey, ivString); // Pass dynamic IV string
    
    let encryptedContent = '';
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const line = `${row.key}${splitter}${row.value}\n`; // Append each row to the content string
      encryptedContent += encryptWithFixedIV(line, saltkey, ivString)+'\n';
    }
    // Encrypt the saltkey (optional)
    const encryptedSaltKey = encryptWithFixedIV(saltkey, saltkey, ivString); // Optional if you want to encrypt the saltkey as well

    // Combine the encrypted content and saltkey into the final file content
     const fileContent = `${encryptedContent}${encryptedSaltKey}`;

    // Create a Blob with the file content and trigger the file download
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`; // Use the provided filename with .txt extension
    link.click();

    // Close the modal after export
    setShowModal(false);
  };

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
              <input
                type="text"
                value={saltkey}
                onChange={(e) => setSaltkey(e.target.value)}
                required
              />
            </label>
            {/* <br />
            <label>
              IV String (Custom IV):
              <input
                type="text"
                value={ivString}
                onChange={(e) => setIvString(e.target.value)}
                required
              />
            </label>
            <br /> */}
            <button onClick={exportData}>Export</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateFile;


// import React, { useState } from "react"; // Import the encrypt function
// import '../styles/CreateFile.css';
// import '../Global.css';
// import { encryptWithFixedIV } from "./ManageCrypto";

// function CreateFile() {
//   const [rows, setRows] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
//   const [showModal, setShowModal] = useState(false);
//   const [filename, setFilename] = useState("");
//   const [saltkey, setSaltkey] = useState("");
//   const [ivString, setIvString] = useState("0000000000000000"); // New state for custom IV string

//   const addRow = () => {
//     setRows([...rows, { key: "", value: "" }]);
//   };

//   const removeRow = (index: number) => {
//     const newRows = rows.filter((_, i) => i !== index);
//     setRows(newRows);
//   };

//   const handleChange = (index: number, field: "key" | "value", value: string) => {
//     const newRows = [...rows];
//     newRows[index][field] = value;
//     setRows(newRows);
//   };

//   const confirmPopUp = () => {
//     setShowModal(true);
//   };

//   const exportData = () => {
//     // Create the content from rows
//     const content = rows
//       .map((row) => `Key: ${row.key}\nValue: ${row.value}\n\n`)
//       .join("");

//     // Use the imported encrypt function with dynamic IV
//     const encryptedContent = encryptWithFixedIV(content, saltkey, ivString); // Pass dynamic IV string

//     // Encrypt the saltkey and password (optional)
//     const encryptedSaltKey = encryptWithFixedIV(saltkey, saltkey, ivString); // Optional if you want to encrypt the saltkey as well

//     // Combine the encrypted content, saltkey, and password into the final file content
//     const fileContent = `${encryptedContent}\n${encryptedSaltKey}`;

//     // Create a Blob and trigger the file download
//     const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${filename}.txt`; // Use the filename provided by the user
//     link.click();

//     // Close the modal after export
//     setShowModal(false);
//   };

//   return (
//     <div id="mainCreateDiv">
//       <div style={{ marginTop: "3vh", width: "68vw" }}>
//         <div style={{ marginBottom: "4vh", display: "flex", justifyContent: "space-between" }}>
//           <h3 className="cursive-font">Fill Below fields...</h3>
//           <div style={{ float: "right" }}>
//             <button onClick={addRow} className="filledcolorbtn cursive-font">Add Row</button>
//             <button onClick={confirmPopUp} className="bordercolorbtn cursive-font">Export</button>
//           </div>
//         </div>

//         {rows.map((row, index) => (
//           <div key={index} style={{ margin: "10px 0", display: "flex", alignItems: "center", marginTop: "5vh" }}>
//             <div style={{ marginRight: "10px" }}>
//               <input
//                 className="bordercolorbtn cursive-font"
//                 type="text"
//                 value={row.key}
//                 onChange={(e) => handleChange(index, "key", e.target.value)}
//                 placeholder="Enter Header"
//                 style={{ width: "40vh", textAlign: "start" }}
//               />
//             </div>
//             <div style={{ marginRight: "10px" }}>
//               <textarea
//                 className="bordercolorbtn cursive-font"
//                 value={row.value}
//                 onChange={(e) => handleChange(index, "value", e.target.value)}
//                 placeholder="Enter Data"
//                 rows={4}
//                 cols={30}
//                 style={{ width: "80vh", textAlign: "start" }}
//               />
//             </div>
//             <button className="filledcolorbtn cursive-font" onClick={() => removeRow(index)}>Remove</button>
//           </div>
//         ))}
//       </div>

//       {/* Modal for filename, saltkey, and password */}
//       {showModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h2>Enter Export Details</h2>
//             <label>
//               Filename:
//               <input
//                 type="text"
//                 value={filename}
//                 onChange={(e) => setFilename(e.target.value)}
//                 required
//               />
//             </label>
//             <br />
//             <label>
//               Password:
//               <input
//                 type="text"
//                 value={saltkey}
//                 onChange={(e) => setSaltkey(e.target.value)}
//                 required
//               />
//             </label>
//             {/* <br />
//             <label>
//               IV String (Custom IV):
//               <input
//                 type="text"
//                 value={ivString}
//                 onChange={(e) => setIvString(e.target.value)}
//                 required
//               />
//             </label>
//             <br /> */}
//             <button onClick={exportData}>Export</button>
//             <button onClick={() => setShowModal(false)}>Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CreateFile;

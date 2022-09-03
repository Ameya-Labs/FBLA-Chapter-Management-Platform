// import { useState, useRef, useEffect } from 'react';

// import { Table, Card, Button, Modal, Form, FloatingLabel, ButtonGroup } from 'react-bootstrap';

// import CSVReader from '../CSVReader/csv-reader.component';

// const UploadCSVModal = ({type, showToggle, onHideHandler}) => {
//     const [uploadedFileName, setUploadedFileName] = useState(null);
//     const [fileData, setFileData] = useState([]);
//     const inputRef = useRef(null); 

//     useEffect(() => {
//         console.log(fileData);
//     }, [fileData])

//     const handleCSVRead = (file) => {
//         const reader = new FileReader();
//         console.log(file)
        
//         reader.onload = event => {
//             try {
//                 const result = event.target.result;
//                 setFileData(result);
//             } catch (e) {
//                 console.log(e)
//             }
//         }
//         reader.readAsText(file);
//     }

//     const handleUpload = () => {
//         inputRef.current.click();
//     };

//     const handleDisplayFileDetails = () => {
//         inputRef.current.files &&
//         setUploadedFileName(inputRef.current.files[0].name);
//         handleCSVRead(inputRef.current.files[0]);
//     };    

//     function capitalizeFirstLetter(string) {
//         return string.charAt(0).toUpperCase() + string.slice(1);
//         }

//   return (
//       <>
//         <Modal show={showToggle} onHide={onHideHandler}>
//             <Modal.Header closeButton>
//                 <Modal.Title>Upload {capitalizeFirstLetter(type)} CSV</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <h4><strong>Instructions:</strong></h4>
//                 <ol>
//                     <li>Download template below.</li>
//                     <li>Enter data into template, confirming template rules are followed.</li>
//                     <li>Upload completed .csv file.</li>
//                     <li>Do not close window or tab while the CSV is uploaded.</li>
//                 </ol>
//                 <hr />
//                 <h4><strong>Step #1: Download {capitalizeFirstLetter(type)} Template:</strong></h4>
//                 <br />
//                 {type === "events" && (
//                     <>
//                     <h6>{capitalizeFirstLetter(type)} Template Notes:</h6>
//                     <ul>
//                         <li>"Name" column: Enter event name properly capitalized with no extra spaces.</li>
//                         <li>"Category" column: Enter one of the following options...</li>
//                             <ul>
//                                 <li>Prejudged</li>
//                                 <li>Testing</li>
//                                 <li>Performance</li>
//                                 <li>Case Study</li>
//                             </ul>
//                         <li>"Conference" column: Enter one of the following options...</li>
//                             <ul>
//                                 <li>FLC</li>
//                                 <li>RLC</li>
//                                 <li>SLC</li>
//                             </ul>
//                         <li>"IntroEvent" column: Enter <i>TRUE</i> if intro event.</li>
//                         <li>"TeamEvent" column: Enter <i>TRUE</i> if team event.</li>
//                         <li>"TeamMemberLimit" column: Enter one of the following options...</li>
//                             <ul>
//                                 <li>No Team</li>
//                                 <li>3</li>
//                                 <li>5</li>
//                             </ul>
//                     </ul>
//                     </>
//                 )}
//                 <br />
//                 <div className="mx-auto" style={{textAlign: "center"}}>
//                     <ButtonGroup>
//                         <a href="./csv_templates/events_template.csv" download><Button variant="primary">Download {capitalizeFirstLetter(type)} Template</Button>
//                         <Button disabled variant="light">.csv</Button>
//                         </a>
//                     </ButtonGroup>
//                 </div>
//                 <hr />
//                 <h4><strong>Step #2: Upload Completed CSV:</strong></h4>
//                 <br />
//                 <div className="mx-auto" style={{textAlign: "center"}}>
//                     <label className="me-3">Choose file:</label>
//                     <input
//                         ref={inputRef}
//                         onChange={handleDisplayFileDetails}
//                         className="d-none"
//                         type="file"
//                     />
//                     <button
//                         onClick={handleUpload}
//                         className={`btn btn-outline-${
//                         uploadedFileName ? "success" : "primary"
//                         }`}
//                     >
//                         {uploadedFileName ? uploadedFileName : "Upload"}
//                     </button>
//                 </div>

//                 <CSVReader></CSVReader>


//             </Modal.Body>
//             <Modal.Footer>
//                 {/* <Button variant="secondary" onClick={handleModalClose}>
//                     Cancel
//                 </Button>
//                 <Button variant="danger" onClick={handleUserDelete}>
//                     Yes, Delete
//                 </Button> */}
//             </Modal.Footer>
//         </Modal>
//       </>
//   );

// };

// export default UploadCSVModal;
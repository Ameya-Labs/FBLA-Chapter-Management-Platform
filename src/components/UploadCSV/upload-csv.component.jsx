import { useState, useEffect } from 'react';

import { Card, Button, Modal, ButtonGroup } from 'react-bootstrap';

import { handleEventsCSVDataUpload, handlePaidMembersCSVDataUpload, handleUsersCSVDataUpload } from '../../utils/firebase/firebase.utils';

import CSVReader from '../CSVReader/csv-reader.component';
import SmallSpinner from '../SmallSpinner/small-spinner.component';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const TOAST_PROPS = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

const UploadCSVModal = ({type, showToggle, onHideHandler}) => {
    const [fileData, setFileData] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showFinishedText, setShowFinishedText] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    useEffect(() => {
        if(fileData) {
            setShowSubmitButton(true);
        }
    }, [fileData])

    const handleCSVSubmitButton = async () => {
        if(fileData && type==="events") {
            try {
                setShowSpinner(true);

                handleEventsCSVDataUpload(fileData).then(() => {
                    setShowSpinner(false);
                    setShowFinishedText(true);
                    toast.success('Successful upload! Refresh page to see new changes...', TOAST_PROPS);
                }).catch((error) => {
                    setShowSpinner(false);
                    toast.error("Failed upload.", TOAST_PROPS);
                });

            } catch (error) {
                console.log(error);
            }
        }
        else if(fileData && type==="paid_members") {
            try {
                setShowSpinner(true);

                handlePaidMembersCSVDataUpload(fileData).then(() => {
                    setShowSpinner(false);
                    setShowFinishedText(true);
                    toast.success('Successful upload! Refresh page to see new changes...', TOAST_PROPS);
                }).catch((error) => {
                    console.log(error)
                    setShowSpinner(false);
                    toast.error("Failed upload.", TOAST_PROPS);
                });

            } catch (error) {
                console.log(error);
            }
        }
        else if(fileData && type==="users") {
            try {
                setShowSpinner(true);

                handleUsersCSVDataUpload(fileData).then(() => {
                    setShowSpinner(false);
                    setShowFinishedText(true);
                    toast.success('Successful upload! Refresh page to see new changes...', TOAST_PROPS);
                }).catch((error) => {
                    console.log(error)
                    setShowSpinner(false);
                    toast.error("Failed upload.", TOAST_PROPS);
                });

            } catch (error) {
                console.log(error);
            }
        };
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

  return (
      <>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />

        <Modal show={showToggle} onHide={onHideHandler}>
            <Modal.Header closeButton>
                <Modal.Title>Upload {capitalizeFirstLetter(type)} CSV</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    showFinishedText ? (<div className="mx-auto" style={{textAlign: "center"}}>
                    
                <h4>100% Finished Uploading</h4>
                <br />
                <p>Refresh to see new {type}</p>
                    
                </div>) : (<>
                
                <h4><strong>Instructions:</strong></h4>
                <ol>
                    <li>Download template below.</li>
                    <li>Enter data into template, confirming template rules are followed. There is a max of 400 rows from the CSV that will be accepted at one time.</li>
                    <li>Upload completed .csv file.</li>
                    <li>Do not close window or tab while the CSV is uploaded.</li>
                </ol>
                <hr />
                <h4><strong>Step #1: Download {capitalizeFirstLetter(type)} Template</strong></h4>
                <br />
                {type === "events" && (
                    <>
                        <h6>{capitalizeFirstLetter(type)} Template Notes:</h6>
                        <ul>
                            <li>"Name" column: Enter event name properly capitalized with no extra spaces.</li>
                            <li>"Category" column: Enter one of the following options...</li>
                                <ul>
                                    <li>Prejudged</li>
                                    <li>Testing</li>
                                    <li>Performance</li>
                                    <li>Case Study</li>
                                </ul>
                            <li>"Conference" column: Enter one of the following options...</li>
                                <ul>
                                    <li>FLC</li>
                                    <li>RLC</li>
                                    <li>SLC</li>
                                </ul>
                            <li>"Group" column: Enter one of the following options...</li>
                                <ul>
                                    <li>A</li>
                                    <li>B</li>
                                    <li>C</li>
                                </ul>
                            <li>"IntroEvent" column: Enter <i>true</i> if intro event or <i>false</i> if not.</li>
                            <li>"TeamEvent" column: Enter <i>true</i> if team event or <i>false</i> if not.</li>
                            <li>"TeamMemberLimit" column: Enter one of the following options...</li>
                                <ul>
                                    <li>No Team</li>
                                    <li>3</li>
                                    <li>5</li>
                                </ul>
                            <li>"CompetitorLimit" column: Enter one of the following options...</li>
                                <ul>
                                    <li>none</li>
                                    <li>1</li>
                                    <li>2</li>
                                    <li>3</li>
                                    <li>4</li>
                                    <li>5</li>
                                </ul>
                        </ul>
                        <p><strong>Example:</strong></p>
                        <img src={require('../../assets/sample-events-template.PNG')} alt='Chapter Pic' style={{width: '100%'}}/>
                        <br />
                    </>
                )}
                {type === "paid_members" && (
                    <>
                        <h6>Paid Members Template Notes:</h6>
                        <ul>
                            <li>"studentNum" column: Enter student's six digit student number.</li>
                            <li>"name" column: Enter full name with proper capitalization.</li>
                            <li>"email" column: Enter email in all lowercase.</li>
                        </ul>
                        <p><strong>Example:</strong></p>
                        <img src={require('../../assets/sample-paid-members-template.PNG')} alt='Chapter Pic' style={{width: '100%'}}/>
                        <br />
                    </>
                )}
                {type === "users" && (
                    <>
                        <h6>Users Template Notes:</h6>
                        <ul>
                            <li>"role" column: Enter one of the following options. Advisers are not allowed to be added through CSV.</li>
                                <ul>
                                    <li>member</li>
                                    <li>officer</li>
                                </ul>
                            <li>"name" column: Enter full name with proper capitalization.</li>
                            <li>"grade" column: Enter one of the following options...</li>
                                <ul>
                                    <li>9</li>
                                    <li>10</li>
                                    <li>11</li>
                                    <li>12</li>
                                </ul>
                            <li>"email" column: Enter email in all lowercase.</li>
                            <li>"studentNum" column: Enter student's six digit student number.</li>
                            <li>"phoneNo" column: Enter 10 digit phone number with no international code, -, or ().</li>
                        </ul>
                        <p><strong>Example:</strong></p>
                        <img src={require('../../assets/sample-users-template.PNG')} alt='Chapter Pic' style={{width: '100%'}}/>
                        <br />
                    </>
                )}
                <br />
                <div className="mx-auto" style={{textAlign: "center"}}>
                    <ButtonGroup>
                        <a href={`./csv_templates/${type}_template.csv`} download><Button variant="primary">Download {capitalizeFirstLetter(type)} Template</Button>
                        <Button disabled variant="light">.csv</Button>
                        </a>
                    </ButtonGroup>
                </div>
                <hr />
                <h4><strong>Step #2: Upload Completed CSV</strong></h4>
                <br />
                
                <CSVReader sendData={setFileData} />
                <div style={{textAlign: "center"}}>
                    {showSubmitButton && (<Button name="CSVUploadData" className="mt-3" variant='primary' onClick={handleCSVSubmitButton}>Upload Data</Button>)}
                </div>
                
                <hr />
                <h4><strong>Step #3: Wait for Processing</strong></h4>
                <br />
                <p>Do not close this window or popup until upload process is completed.</p>

                {showSpinner && (<> 
                    <SmallSpinner />
                    <h6>Processing...</h6>    
                </>)}

                </>) 

                }

            </Modal.Body>
            <Modal.Footer>

            </Modal.Footer>
        </Modal>
      </>
  );

};

export default UploadCSVModal;
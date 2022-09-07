import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Button, Modal, ButtonGroup } from 'react-bootstrap';

import { handleSignupsPromotionCSVDataUpload } from '../../utils/firebase/firebase.utils';

import { fetchEventsStartAsync } from '../../store/events/events.action';
import { selectEvents, selectEventsIsLoading } from '../../store/events/events.selector';

import CSVReader from '../CSVReader/csv-reader.component';
import SmallSpinner from '../SmallSpinner/small-spinner.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const TOAST_PROPS = {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

const UploadSignupsPromotionCSVModal = ({showToggle, onHideHandler}) => {
    const [fileData, setFileData] = useState(null);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showFinishedText, setShowFinishedText] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    const dispatch = useDispatch();

    const master_events = useSelector(selectEvents);
    const isEventLoading = useSelector(selectEventsIsLoading);

    useEffect(() => {
        dispatch(fetchEventsStartAsync());
    }, []);

    useEffect(() => {
        if(fileData) {
            setShowSubmitButton(true);
        }
    }, [fileData])

    const handleCSVSubmitButton = async () => {
      setShowSpinner(true);

      handleSignupsPromotionCSVDataUpload(fileData, master_events).then(() => {
          setShowSpinner(false);
          setShowFinishedText(true);
          toast.success('Successful upload! Refresh page to see new changes...', TOAST_PROPS);
      }).catch((error) => {
          console.log(error)
          setShowSpinner(false);
          toast.error("Failed upload.", TOAST_PROPS);
      });
    };

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
                <Modal.Title>Upload Signups Promotion CSV</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    showFinishedText ? (<div className="mx-auto" style={{textAlign: "center"}}>
                    
                <h4>100% Finished Uploading</h4>
                <br />
                <p>Refresh to see promoted signups</p>
                    
                </div>) : (<>
                
                <h4><strong>Instructions:</strong></h4>
                <ol>
                    <li>Download template below.</li>
                    <li>Enter data into template, confirming template rules are followed. There is a max of 400 rows from the CSV that will be accepted at one time.</li>
                    <li>Upload completed .csv file.</li>
                    <li>Do not close window or tab while the CSV is uploaded.</li>
                </ol>
                <hr />
                <h4><strong>Step #1: Download Signups Promotion Template</strong></h4>
                <br />
                    <>
                        <h6>Signups Promotion Template Notes:</h6>
                        <p><strong>Ignore all columns except "promotedToSLC". Data in other columns will not be uploaded.</strong></p>
                        <ul>
                            <li>"promotedToSLC" column: Enter <i>true</i> if signup should be promoted to SLC or <i>false</i> if signup should be kept as is.</li>
                        </ul>
                        <p><strong>Example:</strong></p>
                        <img src={require('../../assets/sample-signups-promotion-template.PNG')} alt='Chapter Pic' style={{width: '100%'}}/>
                        <br />
                    </>
                <br />
                <div className="mx-auto" style={{textAlign: "center"}}>
                    <ButtonGroup>
                      <DownloadFile specialCode="signupsPromotion" data="signups" />
                      <Button disabled variant="light">.csv</Button>
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

export default UploadSignupsPromotionCSVModal;
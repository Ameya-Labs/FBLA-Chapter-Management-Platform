import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Modal, FloatingLabel, Form, ButtonGroup, ToggleButton } from "react-bootstrap";

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectOtherCompetitorsVisible } from '../../store/db_store/db_store.selector';

import { resetSystem, postCompetitorsVisibleToDBStore } from "../../utils/firebase/firebase.utils";

import Header from '../../components/Header/header.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';
import SmallSpinner from '../../components/SmallSpinner/small-spinner.component';

import APPLICATION_VARIABLES from '../../settings';

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

const Maintenance = () => {
  const [showResetDialogue, setShowResetDialogue] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [enableDeleteButton, setEnableDeleteButton] = useState(false);
  const [checkOtherCompetitorsVisible, setCheckOtherCompetitorsVisible] = useState(false);

  const { role } = useSelector(selectCurrentUser);
  const db_OtherCompetitorsVisible = useSelector(selectOtherCompetitorsVisible);

  useEffect(() => {
    setCheckOtherCompetitorsVisible(db_OtherCompetitorsVisible);
  }, [db_OtherCompetitorsVisible])

  const handleResetSystem = async () => {
    await setShowSpinner(true);
    setShowResetDialogue(false);

    await resetSystem().then(() => {
      setShowSpinner(false);
      //window.location.reload(false);
    });

    setShowSpinner(false);
    handleModalClose();
  };

  const handleModalClose = () => {
    setShowResetDialogue(false);
    setEnableDeleteButton(false);
  };

  const handleToggleDBUpdate = async (value) => {
    const boolConv = value;

    await postCompetitorsVisibleToDBStore(boolConv).then(() => {
      toast.success('Updated setting', TOAST_PROPS);
    });
  }

  return (
    <div >
      <Header />

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

      <Modal show={showSpinner} centered ><Modal.Body><><SmallSpinner /></></Modal.Body></Modal>

      <Modal show={showResetDialogue} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset System for New Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Are you sure you want to reset the system for a new membership year?</strong></p>
          <p><i>This will permanently delete data.</i></p>
          <p><i>Please download all data as CSV first...</i></p>

          <DownloadFile data="users" specialCode="reset" specialType="Users" />
          <DownloadFile data="signups" specialCode="reset" specialType="Signups" />
          <DownloadFile data="events" specialCode="reset" specialType="Events" />
          <DownloadFile data="paid_members" specialCode="reset" specialType="Paid Members" />
          <DownloadFile data="meetings" specialCode="reset" specialType="Meetings" />
          <hr />

          <FloatingLabel
            label="Type resetsystem"
            className="mb-3"
          >
            <Form.Control
              required
              type="text"
              placeholder="resetsystem"
              size="md"
              onChange={(e) => {
                if(e.target.value==="resetsystem") {
                  setEnableDeleteButton(true);
                } else {
                  setEnableDeleteButton(false);
                }
              }}
            />
            <Form.Control.Feedback type="invalid">
              Required to delete.
            </Form.Control.Feedback>
          </FloatingLabel>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
          <Button id="" variant="danger" onClick={handleResetSystem} disabled={!enableDeleteButton}>Yes, Reset System</Button>
        </Modal.Footer>
      </Modal>

      {role === "adviser" && (<div>

        <Card className="mx-auto m-5" style={{ maxWidth: '35rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
          <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Configurations</Card.Header>
          <Card.Body>
            {role === "adviser" && (<>
              <Form.Check
                inline
                label="Allow Members to See Their Event Competitors"
                name="group1"
                type='checkbox'
                id='inline-checkbox-1'
                checked={checkOtherCompetitorsVisible}
                onChange={(e) => {
                  setCheckOtherCompetitorsVisible(e.currentTarget.checked);
                  handleToggleDBUpdate(e.currentTarget.checked);
                }}
              />
            </>)}
          </Card.Body>
        </Card>

        <Card className="mx-auto m-5" style={{ maxWidth: '35rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
          <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>System Maintenance</Card.Header>
          <Card.Body>
            {role === "adviser" && (<>
              <Button type="button" variant="danger" onClick={() => {setShowResetDialogue(true)}}>Reset System for New School Year</Button>
            </>)}
          </Card.Body>
        </Card>
      </div>)}
    </div>
  );
};

export default Maintenance;
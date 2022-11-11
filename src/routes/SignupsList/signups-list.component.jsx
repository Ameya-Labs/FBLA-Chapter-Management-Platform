import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import {useAuthState} from "react-firebase-hooks/auth";
import {useNavigate} from "react-router-dom";

import { Table, Card, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';

import { auth, deleteSignupDoc, updateSignupDoc, promoteSignupDocToSLC, deleteAllSignups, demoteSignupDoc, db } from "../../utils/firebase/firebase.utils";
import { collection, query, onSnapshot } from "firebase/firestore";

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectSignups, selectSignupsIsLoading } from '../../store/signups/signups.selector';
import { selectEvents, selectEventsIsLoading } from '../../store/events/events.selector';
import { selectUsersList, selectUsersListIsLoading } from '../../store/users_list/users-list.selector';
import { fetchUsersListStartAsync } from '../../store/users_list/users-list.action';
import { fetchEventsStartAsync } from '../../store/events/events.action';
import { fetchSignupsStartAsync } from '../../store/signups/signups.action';
import { selectOtherCompetitorsVisible } from '../../store/db_store/db_store.selector';

import Header from "../../components/Header/header.component";
import Spinner from '../../components/Spinner/spinner.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';
import SmallSpinner from '../../components/SmallSpinner/small-spinner.component';
import UploadSignupsPromotionCSVModal from '../../components/UploadSignupsPromotionCSV/upload-signups-promotion-csv.component';

import "bootstrap/dist/css/bootstrap.min.css";
import './signups-list.styles.scss';

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

const DEFAULT_EVENT_SIGNUP_FIELDS = {
    eventName: '',
    conf: '',
    member1: '',
    member2: '',
    member3: '',
    member4: '',
    member5: '',
    id: '',
    inHouseRequired: false,
};

const SignupsList = () => {
    const [user, loading, error] = useAuthState(auth);
    const [showAddEditForm, setShowAddEditForm] = useState(false);
    const [addEditFormType, setAddEditFormType] = useState('Add'); //Add, Edit
    const [validated, setValidated] = useState(false);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [showAllDeleteDialogue, setShowAllDeleteDialogue] = useState(false);
    const [currentSignup, setCurrentSignup] = useState(DEFAULT_EVENT_SIGNUP_FIELDS);
    const [showSpinner, setShowSpinner] = useState(false);
    const [allDeleteToggle, setAllDeleteToggle] = useState(false);
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [signupsForMemberView, setSignupsForMemberView] = useState([]);
    const [master_signups, setMasterSignups] = useState([]);
    const [isSignupsLoading, setIsSignupsLoading] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { role, email } = useSelector(selectCurrentUser);

    // const master_signups = useSelector(selectSignups);
    // const isSignupsLoading = useSelector(selectSignupsIsLoading);

    const master_events = useSelector(selectEvents);
    const isEventLoading = useSelector(selectEventsIsLoading);

    const master_users = useSelector(selectUsersList);
    const isUsersLoading = useSelector(selectUsersListIsLoading);

    const db_otherCompetitorsVisibleToggle = useSelector(selectOtherCompetitorsVisible);

    const signups = master_signups;


    // useEffect(() => {
    //     dispatch(fetchSignupsStartAsync());
    // }, []);

    useEffect(() => {
        setIsSignupsLoading(true);

        const q = query(collection(db, "signups"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const signups = [];
            querySnapshot.forEach((doc) => {
                signups.push(doc.data());
            });

            setMasterSignups(signups);
        });

        return unsubscribe
    }, []);

    useEffect(() => {
        if (master_signups) {
            setIsSignupsLoading(false);
        }
    }, [master_signups])

    useEffect(() => {
        dispatch(fetchEventsStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchUsersListStartAsync());
    }, []);

    useEffect(() => {

        async function pullSignupsDataForMemberView () {
            const filtered_signups = await master_signups.filter(signup => {
                return ((signup.member1 === email || signup.member2 === email || signup.member3 === email || signup.member4 === email || signup.member5 === email));
            });

            var signups_data_for_member_view = [];

            if(filtered_signups.length===2) {
                const eventName1 = filtered_signups[0].eventName;
                const eventName2 = filtered_signups[1].eventName;

                signups_data_for_member_view = await master_signups.filter(signup => {
                    return (signup.eventName === eventName1 || signup.eventName === eventName2)
                });
            } else if (filtered_signups.length===1) {
                const eventName1 = filtered_signups[0].eventName;

                signups_data_for_member_view = await master_signups.filter(signup => {
                    return (signup.eventName === eventName1)
                });
            }

            setSignupsForMemberView(signups_data_for_member_view);
        }

        if (db_otherCompetitorsVisibleToggle && email) {
            pullSignupsDataForMemberView();
        }
    }, [db_otherCompetitorsVisibleToggle, master_signups, email]);

    useEffect(() => {
        if (loading) return;
    }, [user, loading]);

    const handleModalClose = () => {
        setCurrentSignup(DEFAULT_EVENT_SIGNUP_FIELDS);
        setShowAddEditForm(false);
        setShowDeleteDialogue(false);
        setAllDeleteToggle(false);
    }

    const handleSignupDelete = async () => {
        var inHouseRequired = currentSignup.inHouseRequired;
        var additionalSignups = [];

        const event = await master_events.find(event => event.Name === currentSignup.eventName);
        const event_signups = await master_signups.filter(signup => signup.eventName === event.Name);
        const signup_num = event_signups.length;

        if (inHouseRequired && (signup_num - 1 <= parseInt(event.CompetitorLimit))) {
            additionalSignups = event_signups;
        } 

        const signupDoc = {
            id: currentSignup.id,
            inHouseRequired,
        };

        await deleteSignupDoc(signupDoc, additionalSignups).then(() => {toast.error('Deleted', TOAST_PROPS)});
        //alert(`Deletion Successful`);
        handleModalClose();
    }

    const handleAllDeleteModalClose = () => {
        setAllDeleteToggle(false);
        setCurrentSignup(DEFAULT_EVENT_SIGNUP_FIELDS);
        setShowAddEditForm(false);
        setShowAllDeleteDialogue(false);
    }

    const handleAllSignupDelete = async () => {
        await setShowSpinner(true);
        setShowAllDeleteDialogue(false);

        await deleteAllSignups().then(() => {
            setShowSpinner(false);
            window.location.reload(false);
        });

        handleAllDeleteModalClose();
    }

    const handleSLCPromotion = async (id) => {
        await promoteSignupDocToSLC(id).then(() => {toast.success('Promoted', TOAST_PROPS)});
    };

    const handleSignupDemotion = async (id, eventName) => {
        var filtered_event = master_events.find((event) => event.Name === eventName);
        var conf = filtered_event.Conference;
        
        await demoteSignupDoc(id, conf).then(() => {toast.success('Demoted', TOAST_PROPS)});
    };

    function convertEmailToMemberName(email) {
        var filtered_user = master_users.filter((user) => user.email === email)[0];

        if (!filtered_user) {
            return `User Deleted (${email})`;
        } else {
            return `${filtered_user.name} (${filtered_user.grade}th)`;
        }
    };

    function findEvent(rowEvent) {
        var filtered_event = master_events.find((event) => event.Name === rowEvent.eventName)

        return filtered_event;
    };

    const handleCSVModalClose = () => {
        setShowCSVUpload(false);
        setAllDeleteToggle(false);
    };


    return (
        <div>
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

            <UploadSignupsPromotionCSVModal showToggle={showCSVUpload} onHideHandler={handleCSVModalClose} />

            <Modal show={showSpinner} centered ><Modal.Body><><SmallSpinner /></></Modal.Body></Modal> 

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Signup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this signup?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleSignupDelete}>Yes, Delete</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAllDeleteDialogue} onHide={handleAllDeleteModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete All Signups</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Are you sure you want to delete ALL signups?</strong></p>
                    <p>Please first download the signups as CSV before deletion.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAllDeleteModalClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleAllSignupDelete}>Yes, Delete All</Button>
                </Modal.Footer>
            </Modal>


            {
                isEventLoading || isUsersLoading || isSignupsLoading ? <Spinner /> :

            (<>
                {
                    role !== "member"  && 
                    
                    (<Card className="m-3 mx-5">
                    <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                        <div className="align-items-center" style={{ marginRight: 8 }}>
                            <h4 style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Signups</h4>
                        </div>
                        {/* <div>
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="promoteToSLCToggle"
                                label="Promote to SLC"
                                onChange={(e) => setPromoteToSLCToggle(e.target.checked)}
                            />
                            </Form>
                        </div> */}
                        
                        <div>
                            {(role !== "member") && <DownloadFile data="signups" />}
                            {(role !== "member") && <Button className="ms-2" variant="warning" onClick={() => {setShowCSVUpload(true)}}>Promote Signups From CSV</Button>}
                            {/* {(role !== "member") && (<Button variant="dark" onClick={() => {
                                setShowAddEditForm(true);
                            }}>Add New Signup</Button>)} */}
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive striped bordered>
                            <thead>
                            <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                                <th>#</th>
                                <th>Event Name</th>
                                <th>Conf.</th>
                                <th>Member #1</th>
                                <th>Member #2</th>
                                <th>Member #3</th>
                                <th>Member #4</th>
                                <th>Member #5</th>
                                <th>In-House Required</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(signups) && (signups.map((signupItem, index) => (
                                <tr key={index} id={signupItem.id} className={signupItem.inHouseRequired ? 'marked' : ''}>
                                    <td>{index + 1}</td>
                                    <td>{ findEvent(signupItem).TeamMemberLimit === 'No Team' ? signupItem.eventName : `${signupItem.eventName} (Team)` }</td>
                                    <td>{signupItem.conf}</td>
                                    <td>{ signupItem.member1 === "" ? "-" : convertEmailToMemberName(signupItem.member1) }</td>
                                    <td>{ signupItem.member2 === "" ? "-" : convertEmailToMemberName(signupItem.member2) }</td>
                                    <td>{ signupItem.member3 === "" ? "-" : convertEmailToMemberName(signupItem.member3) }</td>
                                    <td>{ signupItem.member4 === "" ? "-" : convertEmailToMemberName(signupItem.member4) }</td>
                                    <td>{ signupItem.member5 === "" ? "-" : convertEmailToMemberName(signupItem.member5) }</td>
                                    <td>{(signupItem.inHouseRequired===true) ? '✓' : '-'}</td>

                                    {(role !== "member") && <td className="space-x-2">
                                        { (signupItem.conf === "RLC" || signupItem.conf === "FLC") &&
                                        (
                                            <Button variant='outline-primary' onClick={() => {
                                                handleSLCPromotion(signupItem.id);
                                            }}>Promote To SLC</Button>
                                        ) 
                                        }
                                        
                                        { (signupItem.promotedToSLC === true && signupItem.conf === "SLC") &&
                                        (
                                            <Button variant='outline-primary' onClick={() => {
                                                handleSignupDemotion(signupItem.id, signupItem.eventName);
                                            }}>Demote To {findEvent(signupItem).Conference}</Button>
                                        )
                                        }
                                        {/* <Button variant='primary' onClick={() => {

                                            setCurrentSignup({
                                                eventName: signupItem.eventName,
                                                conf: signupItem.conf,
                                                member1: signupItem.member1,
                                                member2: signupItem.member2,
                                                member3: signupItem.member3,
                                                member4: signupItem.member4,
                                                member5: signupItem.member5,
                                            })

                                            setAddEditFormType("Edit");
                                            setShowAddEditForm(true);
                                        }}>✎ Edit</Button> */}

                                        <Button className="ms-1" variant='outline-danger' onClick={() => {
                                            setCurrentSignup({
                                                eventName: signupItem.eventName,
                                                conf: signupItem.conf,
                                                member1: signupItem.member1,
                                                member2: signupItem.member2,
                                                member3: signupItem.member3,
                                                member4: signupItem.member4,
                                                member5: signupItem.member5,
                                                id: signupItem.id,
                                                inHouseRequired: signupItem.inHouseRequired,
                                            });

                                            setShowDeleteDialogue(true);
                                        }}>x Delete</Button>
                                </td>}

                                </tr>
                            )))}
                            </tbody>
                        </Table>
                    </Card.Body>
                    <Card.Footer>
                    <div className="d-flex justify-content-between align-items-center">
                        {(role === "adviser") && <p className="mt-3 text-sm text-slate-400">Adviser Only Access</p>}
                        {(role === "officer") && <p className="mt-3 text-sm text-slate-400">Officer Only Access</p>}
                        <div className="d-flex justify-content-between align-items-center text-right pull-right">
                            <Form>
                                <Form.Check 
                                    type="switch"
                                    id="allDeleteToggle"
                                    label=""
                                    checked={allDeleteToggle}
                                    onChange={(e) => setAllDeleteToggle(e.target.checked)}
                                />
                            </Form>
                            <Button className="ms-2" variant="danger" disabled={!allDeleteToggle} onClick={() => {setShowAllDeleteDialogue(true)}}>Delete All Signups</Button>
                        </div>
                    </div>

                    </Card.Footer>
                </Card>)
                }



                {role === "member" && (<> 
                    {
                    (signupsForMemberView.length !== 0 && db_otherCompetitorsVisibleToggle) ? 
                    
                        (<Card className="m-3 mx-5">
                            <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                                <div className="align-items-center" style={{ marginRight: 8 }}>
                                    <h4 style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Signups</h4>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Table responsive striped bordered>
                                    <thead>
                                    <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                                        <th>#</th>
                                        <th>Event Name</th>
                                        <th>Conf.</th>
                                        <th>Member #1</th>
                                        <th>Member #2</th>
                                        <th>Member #3</th>
                                        <th>Member #4</th>
                                        <th>Member #5</th>
                                        <th>In-House Required</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {(signupsForMemberView) && (signupsForMemberView.map((signupItem, index) => (
                                            <tr key={`member-${index}`} className={signupItem.inHouseRequired ? 'marked' : ''}>
                                                <td>{index + 1}</td>
                                                <td>{ findEvent(signupItem).TeamMemberLimit === 'No Team' ? signupItem.eventName : `${signupItem.eventName} (Team)` }</td>
                                                <td>{signupItem.conf}</td>
                                                <td>{ signupItem.member1 === "" ? "-" : convertEmailToMemberName(signupItem.member1) }</td>
                                                <td>{ signupItem.member2 === "" ? "-" : convertEmailToMemberName(signupItem.member2) }</td>
                                                <td>{ signupItem.member3 === "" ? "-" : convertEmailToMemberName(signupItem.member3) }</td>
                                                <td>{ signupItem.member4 === "" ? "-" : convertEmailToMemberName(signupItem.member4) }</td>
                                                <td>{ signupItem.member5 === "" ? "-" : convertEmailToMemberName(signupItem.member5) }</td>
                                                <td>{(signupItem.inHouseRequired===true) ? '✓' : '-'}</td>
                                            </tr>
                                    )
                                    ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                            <Card.Footer>
                            <div className="d-flex justify-content-between align-items-center">
                                <p className="mt-3 text-sm text-slate-400">Member Only Access</p>
                            </div>
                            </Card.Footer>
                        </Card>) 
                    :
                        (<>
                            <br/>
                            <h5>You cannot see other signups at this time.</h5>
                            <Button href='/home'>&larr; Go Back</Button>
                        </>)
                    }
                </>)}
            </>)}
        
        </div>
    );
};

export default SignupsList;
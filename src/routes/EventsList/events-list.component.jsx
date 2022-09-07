import { useEffect, useState, Fragment } from "react";
import { useSelector, useDispatch } from 'react-redux';

import { Table, Card, Button, Modal, Form, FloatingLabel } from 'react-bootstrap';

import { createNewEventDoc, updateEventDoc, deleteEventDoc, postEventResourcesURL, db } from "../../utils/firebase/firebase.utils";
import { collection, query, onSnapshot } from "firebase/firestore";

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectEvents, selectEventsIsLoading } from '../../store/events/events.selector';
import { selectSignups, selectSignupsIsLoading } from '../../store/signups/signups.selector';
import { selectEventResourcesURL } from '../../store/db_store/db_store.selector';
import { fetchEventsStartAsync } from '../../store/events/events.action';
import { fetchSignupsStartAsync } from '../../store/signups/signups.action';

import Header from '../../components/Header/header.component';
import Spinner from '../../components/Spinner/spinner.component';
import UploadCSVModal from '../../components/UploadCSV/upload-csv.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';

import APPLICATION_VARIABLES from '../../settings';

import "bootstrap/dist/css/bootstrap.min.css";
import './events-list.styles.scss';

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

const EventsList = () => {
    const [showAddEditForm, setShowAddEditForm] = useState(false);
    const [addEditFormType, setAddEditFormType] = useState('Add'); //Add, Edit
    const [validated, setValidated] = useState(false);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        "eventName": '',
        "eventCategory": '',
        "eventLimit": '',
        "eventConf": '',
        "eventTeam": '',
        "eventIntro": '',
        "eventGroup": '',
        "eventCompetitorLimit": '',
    });
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [markedRows, setMarkedRows] = useState([]);
    const [showResourcesLinkEditModal, setShowResourcesLinkEditModal] = useState(false);
    const [resourcesURL, setResourcesURL] = useState('');
    const [master_signups, setMasterSignups] = useState([]);
    const [isSignupsLoading, setIsSignupsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [isEventLoading, setIsEventLoading] = useState(true);

    const dispatch = useDispatch();

    const { role } = useSelector(selectCurrentUser);
    
    // const events = useSelector(selectEvents);
    // const isEventLoading = useSelector(selectEventsIsLoading);

    // const master_signups = useSelector(selectSignups);
    // const isSignupsLoading = useSelector(selectSignupsIsLoading);

    const db_eventResourcesURL = useSelector(selectEventResourcesURL);

    // useEffect(() => {
    //     dispatch(fetchEventsStartAsync());
    // }, []);

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
    }, [master_signups]);


    useEffect(() => {
        setIsEventLoading(true);

        const q = query(collection(db, "events"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const eventsList = [];
            querySnapshot.forEach((doc) => {
                eventsList.push(doc.data());
            });

            setEvents(eventsList);
        });

        return unsubscribe
    }, []);

    useEffect(() => {
        if (events) {
            setIsEventLoading(false);
        }
    }, [events]);





    useEffect(() => {
        if (db_eventResourcesURL) {
            setResourcesURL(db_eventResourcesURL)
        }
    }, [db_eventResourcesURL])

    useEffect(() => {
        async function markRows() {
            for (const event of events) {
                const signup_num = await master_signups.filter(signup => signup.eventName === event.Name).length;

                if (signup_num > parseInt(event.CompetitorLimit)) {
                    await setMarkedRows(event.Name)
                }
            }
        }

        markRows();
    }, [master_signups]);

    function toPublishedString(bool){
        if(bool === true){
            return '✓';
        } else {
            return '-';
        }
    }

    function toSimpleString(bool){
        if(bool === true){
            return 'Yes';
        } else {
            return 'No';
        }
    }

    const handleModalClose = () => {
        setCurrentEvent({ "eventName": '', "eventCategory": '', "eventLimit": '', "eventConf": '', "eventTeam": '', "eventIntro": '', "eventGroup": '', "eventCompetitorLimit": ''})
        setShowAddEditForm(false);
        setShowDeleteDialogue(false);
        setShowResourcesLinkEditModal(false);
    }

    const handleAddEditFormSubmit = async (e) => {
        e.preventDefault();
        const { eventName, eventCategory, eventLimit, eventConf, eventTeam, eventIntro, eventGroup, eventCompetitorLimit } = e.target.elements;
        if (eventName.value && eventCategory.value && eventLimit.value && eventConf.value && eventTeam.value && eventIntro.value && eventGroup.value && eventCompetitorLimit.value) {
            // if (eventLimit.value == "No Team") {
            //     eventLimit.value = "";
            // }

            if (addEditFormType === "Add") {

                var event_names = [];
                for (const eventDoc of events) {
                    event_names.push(eventDoc.name);
                }   

                if (event_names.indexOf(eventName.value) === -1) {

                    const eventDoc = {
                        Category: eventCategory.value,
                        TeamMemberLimit: eventLimit.value,
                        Conference: eventConf.value,
                        IntroEvent: (eventIntro.value === 'Yes'),
                        Name: eventName.value,
                        TeamEvent: (eventTeam.value === 'Yes'),
                        Group: eventGroup.value,
                        CompetitorLimit: eventCompetitorLimit.value,
                    };

                    await createNewEventDoc( eventDoc ).then(() => {window.location.reload(false)});
                } else {
                    toast.error('Event already exsists', TOAST_PROPS);
                }

                handleModalClose();
            }

            else if (addEditFormType === "Edit") {

                const eventDoc = {
                    Category: eventCategory.value,
                    TeamMemberLimit: eventLimit.value,
                    Conference: eventConf.value,
                    IntroEvent: (eventIntro.value === 'Yes'),
                    Name: eventName.value,
                    TeamEvent: (eventTeam.value === 'Yes'),
                    Group: eventGroup.value,
                    CompetitorLimit: eventCompetitorLimit.value,
                };

                await updateEventDoc( eventDoc ).then(() => {
                    //toast.success(`${eventName.value} successfully updated.`, TOAST_PROPS);
                    window.location.reload(false)
                });

                handleModalClose();
            }
            }

        setValidated(true)
    }

    const handleEventDelete = async () => {
        await deleteEventDoc(currentEvent.eventName).then(() => {window.location.reload(false)});
        //alert(`Deletion Successful`);
        handleModalClose();
    };

    const handleCSVModalClose = () => {
        setShowCSVUpload(false);
    };

    const handleResourcesURLUpdate = async () => {
        const new_URL = resourcesURL;

        await postEventResourcesURL(new_URL).then(() => {
            toast.success('Updated URL', TOAST_PROPS);
            handleModalClose();
        })
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

            <UploadCSVModal type="events" showToggle={showCSVUpload} onHideHandler={handleCSVModalClose} />

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this event?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleEventDelete}>Yes, Delete</Button>
                </Modal.Footer>
            </Modal>


             <Modal show={showResourcesLinkEditModal} onHide={handleModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Resources Link</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FloatingLabel controlId="eventName" label="URL to Event Resources" className="mb-3" >
                        <Form.Control type='text' placeholder='URL to Event Resources' size='md' value={resourcesURL} onChange={(e) => {
                                setResourcesURL(e.target.value);
                            }} />
                    </FloatingLabel>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleResourcesURLUpdate}>Save</Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showAddEditForm} onHide={handleModalClose}>
                <Form noValidate validated={validated} onSubmit={handleAddEditFormSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{(addEditFormType === 'Add') ? 'Add Event' : 'Edit'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FloatingLabel controlId="eventName" label="Event Name" className="mb-3" >
                            <Form.Control disabled={addEditFormType === "Edit" ? true : false} required type='text' placeholder='Enter event name' size='md' value={currentEvent.eventName} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventName": (e.target.value) ? e.target.value : '',
                                })}} />
                            <Form.Control.Feedback type='invalid'>Event name is required</Form.Control.Feedback>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventCategory" label="Event Category" className="mb-3" >
                            <Form.Select value={currentEvent.eventCategory} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventCategory": e.target.value,
                                })}} >
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="Prejudged">Prejudged</option>
                                <option value="Testing">Testing</option>
                                <option value="Performance">Performance</option>
                                <option value="Case Study">Case Study</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventConf" label="Conference" className="mb-3" >
                            <Form.Select value={currentEvent.eventConf} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventConf": e.target.value,
                                })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="FLC">FLC</option>
                                <option value="RLC">RLC</option>
                                <option value="SLC">SLC</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventGroup" label="Group" className="mb-3" >
                            <Form.Select value={currentEvent.eventGroup} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventGroup": e.target.value,
                                })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventIntro" label="Intro Event?" className="mb-3" >
                            <Form.Select value={currentEvent.eventIntro} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventIntro": e.target.value })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="Yes">True</option>
                                <option value="No">False</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventTeam" label="Team Event?" className="mb-3" >
                            <Form.Select value={currentEvent.eventTeam} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventTeam": e.target.value,
                                })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="Yes">True</option>
                                <option value="No">False</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventLimit" label="Team Member Limit" className="mb-3" >
                            <Form.Select value={currentEvent.eventLimit} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventLimit": e.target.value,
                                })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="No Team">No Team</option>
                                <option value="3">3</option>
                                <option value="5">5</option>
                            </Form.Select>
                        </FloatingLabel>
                        <FloatingLabel controlId="eventCompetitorLimit" label="Competitor Limit" className="mb-3" >
                            <Form.Select value={currentEvent.eventCompetitorLimit} onChange={(e) => {
                                setCurrentEvent({
                                    ...currentEvent,
                                    "eventCompetitorLimit": e.target.value,
                                })}}>
                                <option value="" disabled defaultValue hidden> </option>
                                <option value="none">No Limit</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit">{(addEditFormType === 'Add') ? 'Add' : 'Update'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {
                isEventLoading ? <Spinner /> :

            <Card className="m-3 mx-5">
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                    <div className="align-items-center" style={{ marginRight: 8 }}>
                        <h4 style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Events</h4>
                    </div>
                    
                    <div>
                        {(role !== "member") && <Button className="me-5" variant="light" onClick={() => {setShowResourcesLinkEditModal(true)}}>Edit Resources Link</Button>}
                        {(role !== "member") && <DownloadFile data="events" />}
                        {(role !== "member") && <Button className="m-2" variant="warning" onClick={() => {setShowCSVUpload(true)}}>Upload From CSV</Button>}
                        {(role !== "member") && <Button variant="dark" onClick={() => {
                            setAddEditFormType("Add");
                            setShowAddEditForm(true);
                        }}>Add New Event</Button>}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive striped bordered>
                        <thead>
                        <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                            <th>#</th>
                            <th>Event Name</th>
                            <th>Category</th>
                            <th>Conf.</th>
                            <th>Group</th>
                            <th>Intro Event</th>
                            <th>Team Event</th>
                            <th>Max Team Members</th>
                            <th>Competitor Limit</th>
                            {(role !== "member") && (<th>Actions</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {(events) && (events.map((eventItem, index) => (
                            <tr key={index} className={markedRows.indexOf(eventItem.Name) > -1 ? 'marked' : ''}>
                                <td>{index + 1}</td>
                                <td>{eventItem.Name}</td>
                                <td>{eventItem.Category}</td>
                                <td>{eventItem.Conference}</td>
                                <td>{eventItem.Group}</td>
                                <td>{ toPublishedString(eventItem.IntroEvent) }</td>
                                <td>{ toPublishedString(eventItem.TeamEvent) }</td>
                                <td>{ eventItem.TeamMemberLimit === "No Team" ? "-" : eventItem.TeamMemberLimit }</td>
                                <td>{ eventItem.CompetitorLimit === "none" ? "-" : eventItem.CompetitorLimit }</td>

                                {(role !== "member") && <td className="space-x-2">
                                    <Button variant='outline-primary' onClick={() => {

                                    setCurrentEvent({
                                        "eventName": eventItem.Name,
                                        "eventCategory": eventItem.Category,
                                        "eventLimit": eventItem.TeamMemberLimit,
                                        "eventConf": eventItem.Conference,
                                        "eventTeam": toSimpleString(eventItem.TeamEvent),
                                        "eventIntro": toSimpleString(eventItem.IntroEvent),
                                        "eventGroup": eventItem.Group,
                                        "eventCompetitorLimit": eventItem.CompetitorLimit,
                                    })

                                    setAddEditFormType("Edit");
                                    setShowAddEditForm(true);
                                }}>✎ Edit</Button>
                                    <Button className="ms-1" variant='outline-danger' onClick={() => {
                                    setCurrentEvent({
                                        "eventName": eventItem.Name,
                                        "eventCategory": eventItem.Category,
                                        "eventLimit": eventItem.TeamMemberLimit,
                                        "eventConf": eventItem.Conference,
                                        "eventTeam": toSimpleString(eventItem.TeamEvent),
                                        "eventIntro": toSimpleString(eventItem.IntroEvent),
                                        "eventGroup": eventItem.Group, 
                                        "eventCompetitorLimit": eventItem.CompetitorLimit,
                                    })

                                    setShowDeleteDialogue(true);
                                }}>x Delete</Button>
                            </td>}

                            </tr>
                        )))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    {(role === "adviser") && <p className="mt-3 text-sm text-slate-400">Adviser Only Access</p>}
                    {(role === "officer") && <p className="mt-3 text-sm text-slate-400">Officer Only Access</p>}
                    {(role === "member") && <p className="mt-3 text-sm text-slate-400">Member Only Access</p>}
                </Card.Footer>
            </Card>
            }
        </div>

    );
};

export default EventsList;
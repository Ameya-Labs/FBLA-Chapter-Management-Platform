import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router";

import { auth, createNewMeetingDoc, updateMeetingsAttendanceToggleBool, deleteMeetingDoc, deleteAllMeetings, updateMeetingAttendance, postMeetingURL, db } from "../../utils/firebase/firebase.utils";
import { collection, query, onSnapshot } from "firebase/firestore";

import { fetchMeetingsStartAsync } from '../../store/meetings/meetings.action';

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectMeetingsList, selectMeetingsListIsLoading } from '../../store/meetings/meetings.selector';

import RandomCodeGenerator from '../../functions/random-code-generator.function';

import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    ButtonGroup,
    FloatingLabel
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../../components/Header/header.component";
import SmallSpinner from '../../components/SmallSpinner/small-spinner.component';
import Spinner from '../../components/Spinner/spinner.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';
import DownloadMeetingDetails from '../../components/DownloadMeetingDetails/download-meeting-details.component';

import UploadCSVModal from '../../components/UploadCSV/upload-csv.component';

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

const defaultCurrentMeetingFields = {
    name: "",
    date: "",
    start_time: "",
    end_time: "",
    code: "",
    attendees: [],
    attendanceToggle: false,
    id: "",
    url: "",
};

const MeetingsList = () => {
    const [user, loading, error] = useAuthState(auth);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(defaultCurrentMeetingFields);
    const [newCurrentMeeting, setNewCurrentMeeting] = useState(defaultCurrentMeetingFields);
    const [inputtedMeetingCode, setInputtedMeetingCode] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);
    const [allDeleteToggle, setAllDeleteToggle] = useState(false);
    const [showAllDeleteDialogue, setShowAllDeleteDialogue] = useState(false);
    const [meetings, setMeetings] = useState([]);
    const [master_meetings, setMasterMeetings] = useState([]);
    const [isMeetingsListLoading, setIsMeetingsListLoading] = useState(true);
    const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { role, email, name } = useSelector(selectCurrentUser);

    // const master_meetings = useSelector(selectMeetingsList);
    // const isMeetingsListLoading = useSelector(selectMeetingsListIsLoading);

    // useEffect(() => {
    //     dispatch(fetchMeetingsStartAsync());
    // }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else { 
            console.log("Geolocation is not supported by this browser.");
        }   
        
        function showPosition(position) {
            console.log(position.coords.latitude)
            console.log(position.coords.longitude)
        }
    }, []);

    useEffect(() => {
        setIsMeetingsListLoading(true);

        const q = query(collection(db, "meetings"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const meetingsList = [];
            querySnapshot.forEach((doc) => {
                meetingsList.push(doc.data());
            });

            setMasterMeetings(meetingsList);
        });

        return unsubscribe
    }, []);

    useEffect(() => {
        if (master_meetings) {
            setIsMeetingsListLoading(false);
        }
    }, [master_meetings]);


    useEffect(() => {
        const sorted_meetings = master_meetings.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setMeetings(sorted_meetings.reverse())
    }, [master_meetings])

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
    }, [user, loading]);

    const handleModalClose = () => {
        setCurrentMeeting(defaultCurrentMeetingFields);
        setShowDeleteDialogue(false);
        setShowMeetingLinkModal(false);
    };

    const handleAddNewMeeting = async () => {
        if (newCurrentMeeting.name && newCurrentMeeting.date && newCurrentMeeting.start_time && newCurrentMeeting.end_time) {

            const meetingDoc = {
                name: newCurrentMeeting.name,
                date: newCurrentMeeting.date,
                start_time: newCurrentMeeting.start_time,
                end_time: newCurrentMeeting.end_time,
                code: RandomCodeGenerator(6),
                attendees: [],
                attendanceToggle: false,
                id: RandomCodeGenerator(20),
                flag: 'meeting',
            };

            await createNewMeetingDoc( meetingDoc ).then(() => {window.location.reload(false)});
        } else {
            toast.error('Fill out all new meeting fields', TOAST_PROPS);
        }
    };

    const handleAttendanceToggle = async (id, action) => {
        await updateMeetingsAttendanceToggleBool(id, action).then(() => {window.location.reload(false)});
    };

    const handleMeetingDelete = async () => {
        await deleteMeetingDoc(currentMeeting.id).then(() => {window.location.reload(false)});
    }

    const handleMarkPresent = async (verifiedCode, id, attendees) => {
        var new_attendees = [...attendees, email];

        if (inputtedMeetingCode === verifiedCode) {
            await updateMeetingAttendance(id, new_attendees).then(() => {window.location.reload(false)});
        } else {
            toast.error('Incorrect meeting code', TOAST_PROPS);
        }
    }

    const handleAllDeleteModalClose = () => {
        setCurrentMeeting(defaultCurrentMeetingFields);
        setShowAllDeleteDialogue(false);
    }

    const handleAllMeetingsDelete = async () => {
        await setShowSpinner(true);
        setShowAllDeleteDialogue(false);

        await deleteAllMeetings().then(() => {
            setShowSpinner(false);
            window.location.reload(false);
        });

        handleAllDeleteModalClose();
    };

    const handleMeetingURLUpdate = async () => {
        const id = currentMeeting.id;
        var new_URL = currentMeeting.url;

        if (new_URL.substring(0,4) === 'http') {
            new_URL = `https://${new_URL.split('://')}`;
        } else if (new_URL === '' || new_URL === ' ') {
            new_URL = "";
        } else {
            new_URL = `https://${new_URL}`;
        }

        await postMeetingURL(id, new_URL).then(() => {
            toast.success('Updated URL', TOAST_PROPS);
            handleModalClose();
        })
    };

    function CountAttendees(attendeesArray){
        if (attendeesArray) {
            return `${attendeesArray.length}`
        }
      return;
    }

    function ConvertToReadableDate(date) {
        if (date) {
            const dateParts = date.split("-");

            return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`
        }
        return;
    };

    function ConvertToReadableTime(time) {
        if (time) {
            const timeParts = time.split(":");
            var hours = parseInt(timeParts[0]);
    
            var suffix = (hours >= 12) ? 'PM' : 'AM';
            hours = (hours > 12) ? hours - 12 : hours;
            hours = (hours.toString() === '00' || hours.toString() === '0') ? 12 : hours;
            const minutes = timeParts[1];
    
            return `${hours}:${minutes} ${suffix}`
        }
        return;
    };

    async function DetermineIfActiveMeeting(meetingID, date, start_time, end_time) {

        function ConvertTimeToSeconds(time) {
            var timeParts = time.match(/(\d{2}):(\d{2})/);
            var hours = timeParts[1]
            var minutes = timeParts[2];
            return parseInt(hours) * 3600 + parseInt(minutes) * 60;
        }

        const start_time_in_seconds = (new Date(date).getTime() / 1000) + ConvertTimeToSeconds(start_time) + 14400 - 600; //+14400 to convert from GMT to EST, -600 to start 10 mins before meeting starts
        const end_time_in_seconds = (new Date(date).getTime() / 1000) + ConvertTimeToSeconds(end_time) + 14400 + 900; //+14400 to convert from GMT to EST, +900 to end 15 mins after meeting ends 

        const current_time_in_seconds = new Date() / 1000;

        const action = current_time_in_seconds >= start_time_in_seconds &&  current_time_in_seconds <= end_time_in_seconds;
        
        await updateMeetingsAttendanceToggleBool(meetingID, action);

        return action; // true for active meeting, false for not active meeting
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

            <Modal show={showSpinner} centered ><Modal.Body><><SmallSpinner /></></Modal.Body></Modal> 

            <div>

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Meeting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this meeting?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleMeetingDelete}>
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAllDeleteDialogue} onHide={handleAllDeleteModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete All Meetings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Are you sure you want to delete ALL meetings?</strong></p>
                    <p>Please first download the meetings as CSV before deletion.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAllDeleteModalClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleAllMeetingsDelete}>Yes, Delete All</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showMeetingLinkModal} onHide={handleModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Meeting URL</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FloatingLabel controlId="meetingLink" label="URL to Meeting Presentation/Notes" className="mb-3" >
                        <Form.Control type='text' placeholder='URL to Meeting Presentation/Notes' size='md' value={currentMeeting.url} onChange={(e) => {
                                setCurrentMeeting({
                                    ...currentMeeting,
                                    url: e.target.value,
                                });
                            }} />
                    </FloatingLabel>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleMeetingURLUpdate}>Save</Button>
                </Modal.Footer>
            </Modal>
            

            {
                isMeetingsListLoading ? <Spinner /> :

            <Card className="m-3 mx-5">
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                    <div className="align-items-center mr-8">
                        <h4 className="content-center" style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Meetings</h4>
                    </div>
                    <div>
                        {role !== 'member' && (<DownloadFile data="meetings" />)}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive striped bordered>
                        <thead>
                            <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                                <th>#</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                {role !== 'member' && (<th>Code</th>)}
                                <th>Attendee Count</th>
                                {role !== 'adviser' && (<th>Member Actions</th>)}
                                {role !== 'member' && (<th>Management Actions</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {role !== 'member' && (<tr style={{ backgroundColor: APPLICATION_VARIABLES.NEW_MEETING_ROW_COLOR, color: APPLICATION_VARIABLES.NEW_MEETING_ROW_TEXT_COLOR }}>
                                <td style={{fontWeight:'bold'}}>{"New"}</td>
                                <td>
                                    <Form.Control
                                    required
                                    type="text"
                                    size="sm"
                                    placeholder="Name"
                                    value={newCurrentMeeting.name}
                                    onChange={(e) => {
                                        setNewCurrentMeeting({
                                        ...newCurrentMeeting,
                                        name: e.target.value,
                                        });
                                    }}
                                    />
                                </td>

                                <td>
                                    <Form.Control
                                    required
                                    type="date"
                                    size="sm"
                                    placeholder="Date"
                                    value={newCurrentMeeting.date}
                                    onChange={(e) => {
                                        setNewCurrentMeeting({
                                        ...newCurrentMeeting,
                                        date: e.target.value,
                                        });
                                    }}
                                    />
                                </td>

                                <td>
                                    <Form.Control
                                    required
                                    type="time"
                                    size="sm"
                                    placeholder="Start Time"
                                    value={newCurrentMeeting.start_time}
                                    onChange={(e) => {
                                        setNewCurrentMeeting({
                                        ...newCurrentMeeting,
                                        start_time: e.target.value,
                                        });
                                    }}
                                    />
                                </td>

                                <td>
                                    <Form.Control
                                    required
                                    type="time"
                                    size="sm"
                                    placeholder="End Time"
                                    value={newCurrentMeeting.end_time}
                                    onChange={(e) => {
                                        setNewCurrentMeeting({
                                        ...newCurrentMeeting,
                                        end_time: e.target.value,
                                        });
                                    }}
                                    />
                                </td>

                                <td>{""}</td>
                                <td>{""}</td>
                                {role !== 'adviser' && (<td>{""}</td>)}
                                <td><Button 
                                    variant="light"
                                    onClick={handleAddNewMeeting}
                                    >Add New</Button>
                                </td>
                            </tr>)}
                            {meetings &&
                                meetings.map((meetingItem, index) => (
                                    // TODO center text in row
                                    <tr key={index} className="" >
                                        <td>{index + 1}</td>
                                        <td>{ meetingItem.url ? (<a href={`${meetingItem.url}`} target="_blank">{meetingItem.name}</a>) : meetingItem.name}</td>
                                        <td>{ConvertToReadableDate(meetingItem.date)}</td>
                                        <td>{ConvertToReadableTime(meetingItem.start_time)}</td>
                                        <td>{ConvertToReadableTime(meetingItem.end_time)}</td>
                                        {role !== 'member' && (<td>{meetingItem.code}</td>)}
                                        <td>{CountAttendees(meetingItem.attendees)}</td>

                                        {role !== 'adviser' && meetingItem.attendees && (<td>
                                                {(meetingItem && meetingItem.attendanceToggle && (meetingItem.attendees && meetingItem.attendees.indexOf(email) === -1) && DetermineIfActiveMeeting(meetingItem.id, meetingItem.date, meetingItem.start_time, meetingItem.end_time)) && (<ButtonGroup>
                                                    <Form.Control
                                                        style={{maxWidth:'6rem'}}
                                                        required
                                                        type="text"
                                                        size="md"
                                                        placeholder="Code"
                                                        value={inputtedMeetingCode}
                                                        onChange={(e) => {
                                                            setInputtedMeetingCode(e.target.value);
                                                        }}
                                                    />

                                                    <Button
                                                        className='ms-1'
                                                        variant="outline-dark"
                                                        onClick={() => {handleMarkPresent(meetingItem.code, meetingItem.id, meetingItem.attendees)}}
                                                    >
                                                        Mark Present
                                                    </Button>
                                                </ButtonGroup>)}        

                                                {(meetingItem && meetingItem.attendees.indexOf(email) > -1) && (<>
                                                    <p style={{color: APPLICATION_VARIABLES.MEETING_IN_ATTENDANCE_COLOR}}><strong>In Attendance</strong></p>
                                                </>)}     
                                        </td>)}
                                    
                                        {role !== 'member' && (<>
                                        <td className="space-x-2">
                                                 {/* {meetingItem.attendanceToggle===false ? (<Button
                                                    variant="outline-success"
                                                        onClick={() => {
                                                            handleAttendanceToggle(meetingItem.id, true);
                                                        }}
                                                    >
                                                        Activate
                                                    </Button>) : 
                                                    (<Button
                                                        variant="outline-danger"
                                                            onClick={() => {
                                                                handleAttendanceToggle(meetingItem.id, false);
                                                            }}
                                                        >
                                                            Deactivate
                                                        </Button>)    
                                                    } */}

                                                    <Button
                                                        className="mx-1"
                                                        variant="outline-primary"
                                                        disabled={false}
                                                        onClick={() => {
                                                            setCurrentMeeting({
                                                                ...currentMeeting,
                                                                id: meetingItem.id,
                                                                url: meetingItem.url,
                                                            });

                                                            setShowMeetingLinkModal(true);
                                                        }}
                                                    >
                                                        Edit URL
                                                    </Button>

                                                    <Button
                                                        className="mx-1"
                                                        variant="outline-danger"
                                                        disabled={false}
                                                        onClick={() => {
                                                            setCurrentMeeting({
                                                              name: meetingItem.name,
                                                              date: meetingItem.date,
                                                              start_time: meetingItem.start_time,
                                                              end_time: meetingItem.end_time,
                                                              code: meetingItem.code,
                                                              attendees: meetingItem.attendees,
                                                              attendanceToggle: meetingItem.attendanceToggle,
                                                              id: meetingItem.id,
                                                            });

                                                            setShowDeleteDialogue(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        x Delete
                                                    </Button>

                                                    {/* <Button
                                                    variant="outline-dark"
                                                        onClick={() => {
                                                            setCurrentMeeting({
                                                                name: meetingItem.name,
                                                                date: meetingItem.date,
                                                                start_time: meetingItem.start_time,
                                                                end_time: meetingItem.end_time,
                                                                code: meetingItem.code,
                                                                attendees: meetingItem.attendees,
                                                                attendanceToggle: meetingItem.attendanceToggle,
                                                            });

                                                        }}
                                                    >
                                                        View Details
                                                    </Button> */}

                                                    {meetingItem && (<DownloadMeetingDetails key={meetingItem.id} inputted_data={meetingItem} />)}
                                 
                                        </td></>)}  
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    {(role === "adviser") && <p className="mt-3 text-sm text-slate-400">Adviser Only Access</p>}
                    {(role === "officer") && <p className="mt-3 text-sm text-slate-400">Officer Only Access</p>}
                    {(role === "member") && <p className="mt-3 text-sm text-slate-400">Member Only Access</p>}
                    {role === 'adviser' && (<div className="d-flex justify-content-between align-items-center text-right pull-right">
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="allDeleteToggle"
                                label=""
                                onChange={(e) => setAllDeleteToggle(e.target.checked)}
                            />
                        </Form>
                        <Button className="ms-2" variant="danger" disabled={!allDeleteToggle} onClick={() => {setShowAllDeleteDialogue(true)}}>Delete All Meetings</Button>
                    </div>)}
                </Card.Footer>
            </Card>
            }
        </div>
    </div>
    );
};

export default MeetingsList;
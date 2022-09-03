import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";

import {Card, Dropdown, CardGroup, FloatingLabel, Form, Button, Badge, ButtonGroup, Modal, Col, Row} from "react-bootstrap";

import { postToDBStore, auth, createNewSignupDoc, updateSignupDoc, deleteSignupDoc, postSignupDateToDBStore } from "../../utils/firebase/firebase.utils";

import { submittedNewEventEmail, editedEventEmail, deletedEventEmail } from "../../utils/emails/emails.utils";

import { fetchUsersListStartAsync } from '../../store/users_list/users-list.action';
import { fetchSignupsStartAsync } from '../../store/signups/signups.action';
import { fetchPaidMembersStartAsync } from '../../store/paid_members/paid_members.action';
import { fetchEventsStartAsync } from '../../store/events/events.action';

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectUsersList, selectUsersListIsLoading } from '../../store/users_list/users-list.selector';
import { selectEvents, selectEventsIsLoading } from '../../store/events/events.selector';
import { selectSignups, selectSignupsIsLoading } from '../../store/signups/signups.selector';
import { selectPaidMembersList, selectPaidMembersListIsLoading } from '../../store/paid_members/paid_members.selector';
import { selectSignupConf, selectSignupToggle, selectDBStoreIsLoading, selectSignupDate, selectEventResourcesURL } from '../../store/db_store/db_store.selector';

import RandomCodeGenerator from '../../functions/random-code-generator.function';

import Header from '../../components/Header/header.component';
import NavigationCard from '../../components/NavigationCard/navigation-card.component';
import Spinner from '../../components/Spinner/spinner.component';
import TotalCountCard from '../../components/TotalCardCount/total-card-count.component';
import Calendar from '../../components/Calendar/calendar.component';

import APPLICATION_VARIABLES from '../../settings';

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

const DEFAULT_EVENT_SIGNUP_FIELDS = {
    firstEvent: "",
    firstMember1: "",
    firstMember2: "",
    firstMember3: "",
    firstMember4: "",
    firstMember5: "",
    firstEventID: "",
    secondEvent: "",
    secondMember1: "",
    secondMember2: "",
    secondMember3: "",
    secondMember4: "",
    secondMember5: "",
    secondEventID: "",
};

const DEFAULT_MEMBER_TO_SHOW = {
    memberEmail: "",
    memberName: "",
    memberGrade: "",
};

const Home = () => {
    const [user, loading, error] = useAuthState(auth);

    const [events, setEvents] = useState([]);
    const [members, setMembers] = useState([]);
    const [signups, setSignups] = useState(DEFAULT_EVENT_SIGNUP_FIELDS);
    const [addEditEvent1, setAddEditEvent1] = useState("Add");
    const [addEditEvent2, setAddEditEvent2] = useState("Add");
    const [event2Toggle, setEvent2Toggle] = useState(true);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [deleteIDTracker, setDeleteIDTracker] = useState("");
    const [promotedEvent1, setPromotedEvent1] = useState("");
    const [promotedEvent2, setPromotedEvent2] = useState("");
    const [membersToShow, setMembersToShow] = useState([]);
    const [signupRadio, setSignupRadio] = useState("");
    const [dataForStatBar, setDataForStatBar] = useState({});
    const [signupActivationToggle, setSignupActivationToggle] = useState('');
    const [signupDate, setSignupDate] = useState("");
    const [resourcesLink, setResourcsLink] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { role, name, grade, email } = useSelector(selectCurrentUser);

    const master_users = useSelector(selectUsersList);
    const isUsersListLoading = useSelector(selectUsersListIsLoading);

    const master_events = useSelector(selectEvents);
    const isEventLoading = useSelector(selectEventsIsLoading);

    const master_signups = useSelector(selectSignups);
    const isSignupsLoading = useSelector(selectSignupsIsLoading);
    
    const isDBStoreLoading = useSelector(selectDBStoreIsLoading);
    const signupConf = useSelector(selectSignupConf);
    const signupToggle = useSelector(selectSignupToggle);
    const master_signupDate = useSelector(selectSignupDate);

    const master_paid_members = useSelector(selectPaidMembersList);
    const isPaidMembersLoading = useSelector(selectPaidMembersListIsLoading);

    const db_resourcesLink = useSelector(selectEventResourcesURL);

    useEffect(() => {
        dispatch(fetchEventsStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchUsersListStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchSignupsStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchPaidMembersStartAsync());
    }, []);

    useEffect(() => {
        if (db_resourcesLink) {
            setResourcsLink(db_resourcesLink);
        }
    }, [db_resourcesLink])

    useEffect(() => {
        if (master_signupDate) {
            setSignupDate(master_signupDate);
        }        
    }, [master_signupDate]);

    useEffect(() => {
        if (signupToggle && signupConf) {
            setSignupActivationToggle(signupConf);
        } else {
            setSignupActivationToggle('disable');
        }
        
    }, [signupToggle, signupConf]);

    useEffect(() => {
        const count_Data_OBJ = {
            signups_data: master_signups,
            signups_path: "/signups",
            events_data: master_events,
            events_path: "/events-list",
            users_data: master_users,
            users_path: "/user-list",
            paid_members_data: master_paid_members,
            paid_members_path: "/paid-members-list",
        }

        setDataForStatBar(count_Data_OBJ);
    }, [master_signups, master_events, master_users, master_paid_members]);

    useEffect(() => {
        fetchEvents();
    }, [signupConf, signupToggle, master_events]);

    useEffect(() => {
        fetchMembers();
    }, [signupConf, signupToggle, master_users, name, role, master_signups]);

    useEffect(() => {
        if (!isUsersListLoading && !isEventLoading && !isSignupsLoading && role !== 'adviser') {
            populateSignups();
        }
    }, [master_signups, name, isUsersListLoading, isEventLoading, isSignupsLoading, role]);

    useEffect(() => {
        if (addEditEvent1 === "Edit" || addEditEvent2 === "Edit") {
            createDropdownItemToShow();
        }
    }, [signups, addEditEvent1, addEditEvent2])

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
    }, [user, loading]);

    useEffect(() => {
        if (signupRadio && signupRadio === "FLC") {handleFLCEnable()};
        if (signupRadio && signupRadio === "RLC") {handleRLCEnable()};
        if (signupRadio && signupRadio === "SLC") {handleSLCEnable()};
        if (signupRadio && signupRadio === "disable") {handleDisable()};
    }, [signupRadio])
    

    const fetchEvents = async () => {
        try {
            var filtered_events = [];
            if (signupConf === "FLC") {
                if (grade === "9" || grade === "10") {
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'FLC';
                    });
                }
                else {                    
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'FLC' && event.IntroEvent === false;
                    });
                }
            }
            else if (signupConf === "RLC") {
                if (grade === "9" || grade === "10") {
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'RLC';
                    });
                }
                else {                    
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'RLC' && event.IntroEvent === false;
                    });
                }
            }
            else if (signupConf === "SLC") {
                if (grade === "9" || grade === "10") {
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'SLC';
                    });
                }
                else {
                    filtered_events = master_events.filter(event => {
                        return event.Conference === 'SLC' && event.IntroEvent === false;
                    });
                }
            }

            setEvents(filtered_events);
        } catch (err) {
            console.error(err);
            toast.error("Could not fetch events!", TOAST_PROPS);
        }
    };


    //TODO: need to filter out members if they already have two events signed up

    const fetchMembers = async () => {
        try {
            const filtered_members = master_users.filter((user) => {
                if (signupConf && signupConf === "RLC") {
                    var users_signups = master_signups.filter(signup => {
                        return ((signup.member1 === user.email || signup.member2 === user.email || signup.member3 === user.email || signup.member4 === user.email || signup.member5 === user.email) && (signup.conf === "RLC" || signup.conf === "FLC"));
                    });
                } else {
                    var users_signups = master_signups.filter(signup => {
                        return ((signup.member1 === user.email || signup.member2 === user.email || signup.member3 === user.email || signup.member4 === user.email || signup.member5 === user.email) && signup.conf === signupConf);
                    });
                }
    
                if(users_signups.length===2) {
                    return false;
                };

                return user.email !== email && (user.role === 'officer' || user.role === 'member') && user.paidMember === true;
            });

            filtered_members.sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
            filtered_members.unshift("");
             
            setMembers(filtered_members);
        } catch (error) {
            console.error(error);
            toast.error("Could not fetch members!", TOAST_PROPS);
        }
    };

    const populateSignups = async () => {
        //if SLC signup is enabled, and RLC event is promoted to SLC by adviser, set event and disable Delete Event button?

        var users_signups = [];

        if (email) {


            if (signupConf && signupConf === "RLC") {
                users_signups = await master_signups.filter(signup => {
                    return ((signup.member1 === email || signup.member2 === email || signup.member3 === email || signup.member4 === email || signup.member5 === email) && (signup.conf === "RLC" || signup.conf === "FLC"));
                });
            } else {
                users_signups = await master_signups.filter(signup => {
                    return ((signup.member1 === email || signup.member2 === email || signup.member3 === email || signup.member4 === email || signup.member5 === email) && (signup.conf === signupConf));
                });
            }

            if(users_signups.length===2) {            
                const first_signup = users_signups[0]
                const second_signup = users_signups[1]

                const first_signup_members = [first_signup.member1, first_signup.member2, first_signup.member3, first_signup.member4, first_signup.member5].filter(signup => {
                    return signup !== email
                });

                const second_signup_members = [second_signup.member1, second_signup.member2, second_signup.member3, second_signup.member4, second_signup.member5].filter(signup => {
                    return signup !== email
                });

                if (first_signup.promotedToSLC || (signupConf === "RLC" && first_signup.conf === "FLC")) {
                    setPromotedEvent1(first_signup.eventName);
                }

                if (second_signup.promotedToSLC|| (signupConf === "RLC" && second_signup.conf === "FLC")) {
                    setPromotedEvent2(second_signup.eventName);
                }

                var event_signups = {
                    firstEvent: first_signup.eventName,
                    firstMember1: email,
                    firstMember2: first_signup_members[0],
                    firstMember3: first_signup_members[1],
                    firstMember4: first_signup_members[2],
                    firstMember5: first_signup_members[3],
                    firstEventID: first_signup.id,
                    secondEvent: second_signup.eventName,
                    secondMember1: email,
                    secondMember2: second_signup_members[0],
                    secondMember3: second_signup_members[1],
                    secondMember4: second_signup_members[2],
                    secondMember5: second_signup_members[3],
                    secondEventID: second_signup.id,
                };

                setSignups(event_signups);
                await handleEventChange("1", first_signup.eventName);
                await handleEventChange("2", second_signup.eventName);
                
                setAddEditEvent1("Edit");
                setAddEditEvent2("Edit");
            } else if (users_signups.length===1) {            
                const first_signup = users_signups[0];
                const signup_members = [first_signup.member1, first_signup.member2, first_signup.member3, first_signup.member4, first_signup.member5].filter(signup => {
                    return signup !== email
                })

                if (first_signup.promotedToSLC || (signupConf === "RLC" && first_signup.conf === "FLC")) {
                    setPromotedEvent1(first_signup.eventName);
                }

                var event_signups = {
                    ...DEFAULT_EVENT_SIGNUP_FIELDS,
                    firstEvent: first_signup.eventName,
                    firstMember1: email,
                    firstMember2: signup_members[0],
                    firstMember3: signup_members[1],
                    firstMember4: signup_members[2],
                    firstMember5: signup_members[3],
                    firstEventID: first_signup.id,
                    secondMember1: email,
                };

                setSignups(event_signups);

                await handleEventChange("1", first_signup.eventName);
                setAddEditEvent1("Edit");
            }
            else {
                var event_signups = {
                    ...DEFAULT_EVENT_SIGNUP_FIELDS,
                    firstMember1: email,
                    secondMember1: email,
                };

                setEvent2Toggle(false);
                setSignups(event_signups);
            }
        }
    };


    const handleFLCEnable = async () => {
        await postToDBStore({ signupToggle: true, signupConf: "FLC", signupDate: "" }).then(() => {
            toast.success('Enabled FLC', TOAST_PROPS);
            setSignupActivationToggle('FLC');
        });
    };

    const handleRLCEnable = async () => {
        await postToDBStore({ signupToggle: true, signupConf: "RLC", signupDate: "" }).then(() => {
            toast.success('Enabled RLC', TOAST_PROPS);
            setSignupActivationToggle('RLC');
        });
    };

    const handleSLCEnable = async () => {
        await postToDBStore({ signupToggle: true, signupConf: "SLC", signupDate: "" }).then(() => {
            toast.success('Enabled SLC', TOAST_PROPS);
            setSignupActivationToggle('SLC');
        });
    };

    const handleDisable = async () => {
        await postToDBStore({ signupToggle: false, signupConf: "", signupDate: "" }).then(() => {
            toast.success('Disabled', TOAST_PROPS);
            setSignupActivationToggle('disable');
        });
    };

    const handleSignupDateChange = async (inputtedSignUpDate) => {
        await postSignupDateToDBStore(inputtedSignUpDate).then(() => {
            toast.success('Saved date', TOAST_PROPS);
            setSignupDate(inputtedSignUpDate);
        });
    };

    const handleEventChange = async (eventCall, selectedEvent) => {

        const fetchedEvent = await master_events.filter(event => {
            return event.Name === selectedEvent;
        });

        var secondMemberId = "member" + eventCall + "2";
        var thirdMemberId = "member" + eventCall + "3";
        var fourthMemberId = "member" + eventCall + "4";
        var fifthMemberId = "member" + eventCall + "5";

        if (fetchedEvent[0].TeamMemberLimit === "No Team") {
            document.getElementById(secondMemberId).disabled = true;
            document.getElementById(thirdMemberId).disabled = true;
            document.getElementById(fourthMemberId).disabled = true;
            document.getElementById(fifthMemberId).disabled = true;
        }
        if (fetchedEvent[0].TeamMemberLimit === "3") {
            document.getElementById(secondMemberId).disabled = false;
            document.getElementById(thirdMemberId).disabled = false;
            document.getElementById(fourthMemberId).disabled = true;
            document.getElementById(fifthMemberId).disabled = true;
        }
        if (fetchedEvent[0].TeamMemberLimit === "5") {
            document.getElementById(secondMemberId).disabled = false;
            document.getElementById(thirdMemberId).disabled = false;
            document.getElementById(fourthMemberId).disabled = false;
            document.getElementById(fifthMemberId).disabled = false;
        }
    
    };

    const handleSignUpChange = (event) => {
        const { name, value } = event.target;

        setSignups({...signups, [name]: value});
        
        if (name === "firstEvent") {
            handleEventChange("1", value);
        }
        else if (name === "secondEvent") {
            handleEventChange("2", value);
        }
    };

    const handleSubmitEmailSend = async (signupDoc) => {
        const selected_event = await master_events.find(event => event.Name === signupDoc.eventName);

        if (selected_event.TeamMemberLimit !== 'No Team') {

            var emails = [email];
            var added2 = '';
            var added3 = '';
            var added4 = '';
            var added5 = '';

            if (signupDoc.member2) {
                await emails.push(signupDoc.member2);
                var added2 = master_users.find(member => member.email === signupDoc.member2).name;
            };
            if (signupDoc.member3) {
                await emails.push(signupDoc.member3)
                var added3 = master_users.find(member => member.email === signupDoc.member3).name;
            };
            if (signupDoc.member4) {
                await emails.push(signupDoc.member4)
                var added4 = master_users.find(member => member.email === signupDoc.member4).name;
            };
            if (signupDoc.member5) {
                await emails.push(signupDoc.member5)
                var added5 = master_users.find(member => member.email === signupDoc.member5).name;
            };

            const submitEmailDoc = {
                toEmails: emails,
                eventName: signupDoc.eventName, 
                adderName: name,
                added2, 
                added3, 
                added4, 
                added5,
            };

            await submittedNewEventEmail(submitEmailDoc);
        }
    };

    const handleEditEmailSend = async (signupDoc) => {

        var emails = [email];
        var oldMember2 = '';
        var oldMember3 = '';
        var oldMember4 = '';
        var oldMember5 = '';
        var newMember2 = '';
        var newMember3 = '';
        var newMember4 = '';
        var newMember5 = '';

        const selected_signup = await master_signups.find(signup => signup.id === signupDoc.id);
        const selected_signup_members = await [selected_signup.member1, selected_signup.member2, selected_signup.member3, selected_signup.member4, selected_signup.member5].filter(signup => {
            return signup !== email
        });

        if (selected_signup_members[0]) {
            await emails.push(selected_signup_members[0]);
            oldMember2 = await master_users.find(member => member.email === selected_signup_members[0]).name;
        };
        if (selected_signup_members[1]) {
            await emails.push(selected_signup_members[1])
            oldMember3 = await master_users.find(member => member.email === selected_signup_members[1]).name;
        };
        if (selected_signup_members[2]) {
            await emails.push(selected_signup_members[2])
            oldMember4 = await master_users.find(member => member.email === selected_signup_members[2]).name;
        };
        if (selected_signup_members[3]) {
            await emails.push(selected_signup_members[3])
            oldMember5 = await master_users.find(member => member.email === selected_signup_members[3]).name;
        };


        if (signupDoc.member2) {
            await emails.push(signupDoc.member2);
            newMember2 = await master_users.find(member => member.email === signupDoc.member2).name;
        };
        if (signupDoc.member3) {
            await emails.push(signupDoc.member3)
            newMember3 = await master_users.find(member => member.email === signupDoc.member3).name;
        };
        if (signupDoc.member4) {
            await emails.push(signupDoc.member4)
            newMember4 = await master_users.find(member => member.email === signupDoc.member4).name;
        };
        if (signupDoc.member5) {
            await emails.push(signupDoc.member5)
            newMember5 = await master_users.find(member => member.email === signupDoc.member5).name;
        };


        const editEmailDoc = {
            toEmails: emails,
            eventName: signupDoc.eventName, 
            editorName: name, 
            oldMember2, 
            oldMember3, 
            oldMember4, 
            oldMember5, 
            newMember2, 
            newMember3, 
            newMember4, 
            newMember5, 
        };

        await editedEventEmail(editEmailDoc);
    }



    const handleDeleteEmailSend = async (signupDoc) => {

        var emails = [email];
        var oldMember2 = '';
        var oldMember3 = '';
        var oldMember4 = '';
        var oldMember5 = '';
        var newMember2 = '';
        var newMember3 = '';
        var newMember4 = '';
        var newMember5 = '';

        const selected_signup = await master_signups.find(signup => signup.id === signupDoc.id);
        const selected_signup_members = await [selected_signup.member1, selected_signup.member2, selected_signup.member3, selected_signup.member4, selected_signup.member5].filter(signup => {
            return signup !== email
        });

        if (selected_signup_members[0]) {
            await emails.push(selected_signup_members[0]);
            oldMember2 = await master_users.find(member => member.email === selected_signup_members[0]).name;
        };
        if (selected_signup_members[1]) {
            await emails.push(selected_signup_members[1])
            oldMember3 = await master_users.find(member => member.email === selected_signup_members[1]).name;
        };
        if (selected_signup_members[2]) {
            await emails.push(selected_signup_members[2])
            oldMember4 = await master_users.find(member => member.email === selected_signup_members[2]).name;
        };
        if (selected_signup_members[3]) {
            await emails.push(selected_signup_members[3])
            oldMember5 = await master_users.find(member => member.email === selected_signup_members[3]).name;
        };


        if (signupDoc.member1) {
            await emails.push(signupDoc.member1);
            newMember2 = await master_users.find(member => member.email === signupDoc.member1).name;
        };
        if (signupDoc.member2) {
            await emails.push(signupDoc.member2)
            newMember3 = await master_users.find(member => member.email === signupDoc.member2).name;
        };
        if (signupDoc.member3) {
            await emails.push(signupDoc.member3)
            newMember4 = await master_users.find(member => member.email === signupDoc.member3).name;
        };
        if (signupDoc.member4) {
            await emails.push(signupDoc.member4)
            newMember5 = await master_users.find(member => member.email === signupDoc.member4).name;
        };


        const deleteEmailDoc = {
            toEmails: emails,
            eventName: signupDoc.eventName, 
            deletorName: name, 
            oldMember2, 
            oldMember3, 
            oldMember4, 
            oldMember5, 
            newMember2, 
            newMember3, 
            newMember4, 
            newMember5, 
        };

        await deletedEventEmail(deleteEmailDoc);
    }


    const submitEvent1 = async () => {
        if (signups.firstEvent) {
            const docID = signups.firstEvent + "?" + RandomCodeGenerator(6);

            if (addEditEvent1 === "Add") {
                var inHouseRequired = false;
                var additionalSignups = [];

                const event = await master_events.find(event => event.Name === signups.firstEvent);
                const event_signups = await master_signups.filter(signup => signup.eventName === event.Name);
                const signup_num = event_signups.length;
    
                if (signup_num >= parseInt(event.CompetitorLimit)) {
                    inHouseRequired = true;
                    additionalSignups = event_signups;
                }

                const signupDoc = {
                    docID,
                    eventName: signups.firstEvent,
                    member1: signups.firstMember1,
                    member2: signups.firstMember2,
                    member3: signups.firstMember3,
                    member4: signups.firstMember4,
                    member5: signups.firstMember5,
                    conf: signupConf,
                    id: docID,
                    inHouseRequired
                };

                await createNewSignupDoc(signupDoc, additionalSignups).then(async () => {
                    await handleSubmitEmailSend(signupDoc);

                    await setAddEditEvent1("Edit");
                    await setEvent2Toggle(true);
                    window.location.reload(false)
                });
                
            } else if (addEditEvent1 === "Edit") {
                const signupDoc = {
                    id: signups.firstEventID,
                    eventName: signups.firstEvent,
                    member1: signups.firstMember1,
                    member2: signups.firstMember2,
                    member3: signups.firstMember3,
                    member4: signups.firstMember4,
                    member5: signups.firstMember5,
                };

                const selected_event = await master_events.find(event => event.Name === signupDoc.eventName);

                if (selected_event.TeamMemberLimit !== 'No Team') {
                    await updateSignupDoc(signupDoc).then(async () => {
                        await handleEditEmailSend(signupDoc);
                        window.location.reload(false)
                    }); // TODO NOTIFICATION
                } else {
                    toast.error('Cannot edit an individual event.', TOAST_PROPS);
                }
                
            }
        } else {
            toast.error('Select an event', TOAST_PROPS);
        }
    };

    const submitEvent2 = async () => {
        if (signups.secondEvent) {
            const docID = signups.secondEvent + "?" + RandomCodeGenerator(6);

            if (addEditEvent2 === "Add") {
                var inHouseRequired = false;
                var additionalSignups = [];

                const event = await master_events.find(event => event.Name === signups.secondEvent);
                const event_signups = await master_signups.filter(signup => signup.eventName === event.Name);
                const signup_num = event_signups.length;
    
                if (signup_num >= parseInt(event.CompetitorLimit)) {
                    inHouseRequired = true;
                    additionalSignups = event_signups;
                }

                const signupDoc = {
                    docID,
                    eventName: signups.secondEvent,
                    member1: signups.secondMember1,
                    member2: signups.secondMember2,
                    member3: signups.secondMember3,
                    member4: signups.secondMember4,
                    member5: signups.secondMember5,
                    conf: signupConf,
                    id: docID,
                    inHouseRequired
                };

                await createNewSignupDoc(signupDoc, additionalSignups).then(async () => {
                    await handleSubmitEmailSend(signupDoc);

                    await setAddEditEvent2("Edit")
                    window.location.reload(false)
                });
            } else if (addEditEvent2 === "Edit") {
                const signupDoc = {
                    id: signups.secondEventID,
                    eventName: signups.secondEvent,
                    member1: signups.secondMember1,
                    member2: signups.secondMember2,
                    member3: signups.secondMember3,
                    member4: signups.secondMember4,
                    member5: signups.secondMember5,
                };

                const selected_event = await master_events.find(event => event.Name === signupDoc.eventName);

                if (selected_event.TeamMemberLimit !== 'No Team') {
                    await updateSignupDoc(signupDoc).then(async () => {
                        await handleEditEmailSend(signupDoc);
                        window.location.reload(false);
                    }); // TODO NOTIFICATION
                } else {
                    toast.error('Cannot edit an individual event.', TOAST_PROPS);
                }
                
            }
        } else {
            toast.error('Select an event', TOAST_PROPS);
        }
    };


    const handleEventDelete = async () => {

        if (deleteIDTracker === '1') {
            if (signups.firstMember2 === "" && signups.firstMember3 === "" && signups.firstMember4 === "" && signups.firstMember5 === "") {

                var inHouseRequired = master_signups.find(signup => signup.id === signups.firstEventID).inHouseRequired;
                var additionalSignups = [];

                const event = await master_events.find(event => event.Name === signups.firstEvent);
                const event_signups = await master_signups.filter(signup => signup.eventName === event.Name);
                const signup_num = event_signups.length;
    
                if (inHouseRequired && (signup_num - 1 <= parseInt(event.CompetitorLimit))) {
                    additionalSignups = event_signups;
                } 

                const signupDoc = {
                    id: signups.firstEventID,
                    inHouseRequired
                };
                
                await deleteSignupDoc(signupDoc, additionalSignups).then(() => {window.location.reload(false)});
                // TODO show successful notification
            } else {
                const signupDoc = {
                    id: signups.firstEventID,
                    eventName: signups.firstEvent,
                    member1: signups.firstMember2,
                    member2: signups.firstMember3,
                    member3: signups.firstMember4,
                    member4: signups.firstMember5,
                    member5: '',
                };
                
                await updateSignupDoc(signupDoc).then(async () => {
                    await handleDeleteEmailSend(signupDoc);
                    window.location.reload(false)
                });
                // TODO show successful notification
            }
        }
        else if (deleteIDTracker === '2') {
            if (signups.secondMember2 === "" && signups.secondMember3 === "" && signups.secondMember4 === "" && signups.secondMember5 === "") {
                var inHouseRequired = master_signups.find(signup => signup.id === signups.secondEventID).inHouseRequired;
                var additionalSignups = [];

                const event = await master_events.find(event => event.Name === signups.secondEvent);
                const event_signups = await master_signups.filter(signup => signup.eventName === event.Name);
                const signup_num = event_signups.length;
    
                if (inHouseRequired && (signup_num - 1 <= parseInt(event.CompetitorLimit))) {
                    additionalSignups = event_signups;
                } 

                const signupDoc = {
                    id: signups.secondEventID,
                    inHouseRequired
                };
                
                await deleteSignupDoc(signupDoc, additionalSignups).then(() => {window.location.reload(false)});
                // TODO show successful notification
            } else {
                const signupDoc = {
                    id: signups.secondEventID,
                    eventName: signups.secondEvent,
                    member1: signups.secondMember2,
                    member2: signups.secondMember3,
                    member3: signups.secondMember4,
                    member4: signups.secondMember5,
                    member5: '',
                };
                
                await updateSignupDoc(signupDoc).then(async () => {
                    await handleDeleteEmailSend(signupDoc);
                    window.location.reload(false)
                });
                // TODO show successful notification
            }
        };

        await populateSignups();
        handleModalClose();
        setDeleteIDTracker("");
    };

    const handleModalClose = () => {
        var promise = new Promise( (resolve, reject) => {
            setDeleteIDTracker("");
            setShowDeleteDialogue(false);
   
            resolve("success");
         });
   
         promise.then(() => {window.location.reload(false)});
    };
    
    const createDropdownItemToShow = async () => {
        const memberEmailsToCheck = [signups.firstMember2, signups.firstMember3, signups.firstMember4, signups.firstMember5, signups.secondMember2, signups.secondMember3, signups.secondMember4, signups.secondMember5];
        const memberArray = await members.map((member) => member.email);

        const membersToShowArray = [];

        for (const memberEmail of memberEmailsToCheck.values()) {
            if (memberEmail !== "") {
                const selectedMember = await master_users.find(member => member.email === memberEmail);

                if(memberArray.indexOf(memberEmail) === -1) {
                    var MemberToShow = {
                        memberEmail: selectedMember.email,
                        memberName: selectedMember.name,
                        memberGrade: selectedMember.grade,
                    }
                    
                    const exsistingMemberArray = await membersToShowArray.map((member) => member.memberEmail);

                    if (exsistingMemberArray.indexOf(MemberToShow.memberEmail) === -1) {
                        membersToShowArray.push(MemberToShow);
                    }
                }
            }
        }

        setMembersToShow(membersToShowArray);
    };

    function ConvertToReadableDate(dbDate) {
        const dateParts = dbDate.split("-");

        return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`
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

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Event #{deleteIDTracker} Signup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Are you sure you want to delete this signup?</strong></p>
                    <p><i>If this signup includes a team, you will be removed from the team. This is permanent. You will have to ask your team members to add you back again if needed.</i></p>
                    <p><i>This signup will be deleted if it is an individual event or you're the only one on the team.</i></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                    <Button id="" variant="danger" onClick={handleEventDelete}>Yes, Delete</Button>
                </Modal.Footer>
            </Modal>

            {
                isEventLoading || isUsersListLoading || isSignupsLoading || isDBStoreLoading || isPaidMembersLoading ? <Spinner /> :

            (<>
                {role && (<Card className="m-5 mt-4 mb-7 mx-auto" style={{ maxWidth: '60rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
                    <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR, fontSize: '18px' }}>Welcome, <strong>{name}</strong>! <Badge pill bg="danger">{role.toUpperCase()}</Badge></Card.Header>
                    <Card.Body>
                        {role && <Calendar role={role} />}
                        
                        {dataForStatBar.events_data && dataForStatBar.signups_data && dataForStatBar.users_data && dataForStatBar.paid_members_data && role && <TotalCountCard data_OBJ={dataForStatBar} role={role} />}
                        
                        {role === "adviser" && (<div>
                            <hr />
                            <h6><strong><i>Enable/Disable Event Registration</i></strong></h6>
                            <Form.Check
                                inline
                                label="Enable FLC"
                                name="signupGroup"
                                type="radio"
                                id="FLC"
                                checked={signupActivationToggle === 'FLC'}
                                onChange={(e) => {
                                    setSignupRadio(e.target.id);
                                    if (e.target.checked) {

                                    }
                                }
                                }
                            />
                            <Form.Check
                                inline
                                label="Enable RLC"
                                name="signupGroup"
                                type="radio"
                                id="RLC"
                                checked={signupActivationToggle === 'RLC'}
                                onChange={(e) => setSignupRadio(e.target.id)}
                            />
                            <Form.Check
                                inline
                                label="Enable SLC"
                                name="signupGroup"
                                type="radio"
                                id="SLC"
                                checked={signupActivationToggle === 'SLC'}
                                onChange={(e) => setSignupRadio(e.target.id)}
                            />
                            <Form.Check
                                inline
                                label="Disable"
                                name="signupGroup"
                                type="radio"
                                id="disable"
                                checked={signupActivationToggle === 'disable'}
                                onChange={(e) => setSignupRadio(e.target.id)}
                            />

                            {signupActivationToggle !== 'disable' && (<>
                                <FloatingLabel
                                    label="Signups Due Date"
                                    style={{ maxWidth: '10rem', textAlign: "center" }}
                                    className="mx-auto mt-2"
                                >
                                <Form.Control className="mx-auto mt-2" type="date" name='date_of_birth' style={{ maxWidth: '10rem', textAlign: "center" }} value={signupDate} onChange={(e) => {handleSignupDateChange(e.target.value)}} />
                                </FloatingLabel>
                            </>)}
                        </div>)}
                    </Card.Body>
                </Card>)}


                {/* {(role === "adviser" || role === "officer") && (<Card className="m-5 mt-4 mb-7 mx-auto" style={{ maxWidth: '80rem' }}>
                    <Card.Body>
                        <CardGroup>
                            {role === "adviser" && (<NavigationCard path="/paid-members-list" type="Paid Members" />)}
                            <NavigationCard path="/user-list" type="Users" />
                            <NavigationCard path="/events-list" type="Events" />
                            <NavigationCard path="/signups" type="Signups" />
                        </CardGroup>
                    </Card.Body>
                </Card>)} */}

                {role !== "adviser" && signupToggle && (<Card className="m-5 mt-4 mb-7 mx-auto" style={{ maxWidth: '60rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
                    {signupDate !== "" ? (<Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>{signupConf} Competitive Event Signup - Due on <strong>{ConvertToReadableDate(signupDate)}</strong></Card.Header>) : (<Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>{signupConf} Competitive Event Signup</Card.Header>)}
                    <Card.Body>
                        <div>
                            {resourcesLink && (<Button className="me-2" href={resourcesLink} variant="secondary" target='_blank'>Events Resources</Button>)}
                            <Button href="/events-list" variant="secondary">Events List</Button>
                        </div>
                        <Card.Text></Card.Text>
                        <CardGroup style={{ align: 'center', display: "flex", flexDirection: "row", justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
                        <Card className="mb-2" bg="light" text="black" style={{ maxWidth: '30rem' }}>
                            <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Competitive Event #1</Card.Header>
                            <Card.Body>

                                <FloatingLabel
                                    controlId="event1"
                                    label="Event Name"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        value={signups.firstEvent}
                                        onChange={handleSignUpChange}
                                        name="firstEvent"
                                        disabled={addEditEvent1==="Edit"}
                                        
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>
                                        <option value={`${promotedEvent1}`} disabled hidden>
                                            {promotedEvent1}
                                        </option>
                                        {(events) && (events.map((event, index) => (
                                            <option key={index} value={event.Name}>
                                                {event.Name}</option>)))}

                                    </Form.Select>
                                </FloatingLabel>

                                <hr/>

                                <FloatingLabel
                                    controlId="member11"
                                    label="Member #1"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.firstMember1}
                                        onChange={handleSignUpChange}
                                        name="firstMember1"
                                    >
                                        <option value={email} disabled defaultValue hidden>
                                            {name} ({grade}th)
                                        </option>
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member12"
                                    label="Member #2"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.firstMember2}
                                        onChange={handleSignUpChange}
                                        name="firstMember2"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>
                                        
                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.firstMember2)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.firstMember3 && member.email !== signups.firstMember4 && member.email !== signups.firstMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}

                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member13"
                                    label="Member #3"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.firstMember3}
                                        onChange={handleSignUpChange}
                                        name="firstMember3"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.firstMember3)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.firstMember2 && member.email !== signups.firstMember4 && member.email !== signups.firstMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member14"
                                    label="Member #4"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.firstMember4}
                                        onChange={handleSignUpChange}
                                        name="firstMember4"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.firstMember4)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.firstMember2 && member.email !== signups.firstMember3 && member.email !== signups.firstMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member15"
                                    label="Member #5"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.firstMember5}
                                        onChange={handleSignUpChange}
                                        name="firstMember5"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.firstMember5)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.firstMember2 && member.email !== signups.firstMember3 && member.email !== signups.firstMember4 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>


                                <div className="mx-auto">
                                    {addEditEvent1 === "Add" && (<Button type="submit" variant="outline-primary" onClick={ submitEvent1 }>Submit Event #1</Button>)}

                                    {addEditEvent1 === "Edit" && (<Button type="submit" variant="outline-primary" onClick={ submitEvent1 }>Submit Event #1 Edits</Button>)}
                                    <br />
                                    {addEditEvent1 === "Edit" && (<Button type="reset" variant="outline-danger" className="mt-2" onClick={async () => {
                                        await populateSignups(); 
                                        await setDeleteIDTracker("1");
                                        setShowDeleteDialogue(true);
                                    } }>Delete Event Signup</Button>)}
                                </div>

                            </Card.Body>
                        </Card>

                        {event2Toggle && (<Card className="mb-2" bg="light" text="black" style={{marginLeft: 10, maxWidth: '30rem' }}>
                            <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Competitive Event #2</Card.Header>
                            <Card.Body>

                                <FloatingLabel
                                    controlId="event2"
                                    label="Event Name"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        value={signups.secondEvent}
                                        onChange={handleSignUpChange}
                                        name="secondEvent"
                                        disabled={addEditEvent2==="Edit"}
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>
                                        <option value={`${promotedEvent2}`} disabled hidden>
                                            {promotedEvent2}
                                        </option>
                                        {(events) && (events.map((event, index) => {
                                            if (event.Name !== signups.firstEvent && (master_events.find(event => event.Name === signups.firstEvent).Group === "A" || (master_events.find(event => event.Name === signups.firstEvent).Group !== "A" && event.Group !== master_events.find(event => event.Name === signups.firstEvent).Group))) {
                                            return <option key={index} value={event.Name}>
                                            {event.Name}</option>
                                        }}))}

                                    </Form.Select>
                                </FloatingLabel>

                                <hr/>

                                <FloatingLabel
                                    controlId="member21"
                                    label="Member #1"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.secondMember1}
                                        onChange={handleSignUpChange}
                                        name="secondMember1"
                                    >
                                        <option value={email} disabled defaultValue hidden>
                                            {name} ({grade}th)
                                        </option>
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member22"
                                    label="Member #2"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.secondMember2}
                                        onChange={handleSignUpChange}
                                        name="secondMember2"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.secondMember2)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.secondMember3 && member.email !== signups.secondMember4 && member.email !== signups.secondMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}

                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member23"
                                    label="Member #3"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.secondMember3}
                                        onChange={handleSignUpChange}
                                        name="secondMember3"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.secondMember3)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.secondMember2 && member.email !== signups.secondMember4 && member.email !== signups.secondMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member24"
                                    label="Member #4"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.secondMember4}
                                        onChange={handleSignUpChange}
                                        name="secondMember4"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.secondMember4)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.secondMember2 && member.email !== signups.secondMember3 && member.email !== signups.secondMember5 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>

                                <FloatingLabel
                                    controlId="member25"
                                    label="Member #5"
                                    className="mb-3"
                                    style={{textAlign: "left", width: "100%"}}
                                >
                                    <Form.Select
                                        disabled={true}
                                        value={signups.secondMember5}
                                        onChange={handleSignUpChange}
                                        name="secondMember5"
                                    >
                                        <option value="" disabled defaultValue hidden>
                                            {" "}
                                        </option>

                                        {(membersToShow) && (membersToShow.map((member, index) => {
                                            if (member && (member.memberEmail === signups.secondMember5)) {
                                                return (<option key={index} value={member.memberEmail}>
                                                    {member.memberName} ({member.memberGrade}th)</option>)
                                            }
                                        }))}

                                        {(members) && (members.map((member, index) => {
                                            if (member.email !== signups.secondMember2 && member.email !== signups.secondMember3 && member.email !== signups.secondMember4 && member !== "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name} ({member.grade}th)</option>)
                                            } else if (member === "") {
                                                return (<option key={index} value={member.email}>
                                                    {member.name}</option>)
                                            }
                                        }))}
                                    </Form.Select>
                                </FloatingLabel>


                                <div className="mx-auto">
                                    {addEditEvent2 === "Add" && (<Button type="submit" variant="outline-primary" onClick={ submitEvent2 }>Submit Event #2</Button>)}
                                    {addEditEvent2 === "Edit" && (<Button type="submit" variant="outline-primary" onClick={ submitEvent2 }>Submit Event #2 Edits</Button>)}
                                    <br />
                                    {addEditEvent2 === "Edit" && (<Button id="event2Delete" type="reset" variant="outline-danger" className="mt-2" onClick={ async () => {
                                        await populateSignups(); 
                                        await setDeleteIDTracker("2");
                                        setShowDeleteDialogue(true);
                                    } }>Delete Event Signup</Button>)}
                                </div>

                            </Card.Body>
                        </Card>)}
                        </CardGroup>
                    </Card.Body>
                </Card>)}

                {role !== "adviser" && !signupToggle && (<Card className="m-5 mt-4 mb-7 mx-auto" style={{ maxWidth: '60rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
                    <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Event Signup</Card.Header>
                    <Card.Body>
                        <div>
                            {resourcesLink && (<Button className="me-2" href={resourcesLink} variant="secondary" target='_blank'>Events Resources</Button>)}
                            <Button href="/events-list" variant="secondary">Events List</Button>
                        </div>
                        <Card.Title className="mt-3">Event signups are not available.</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">Please check back later.</Card.Subtitle>
                    </Card.Body>
                </Card>)}
            </>)}
            
        
        </div>

    );
};

export default Home;
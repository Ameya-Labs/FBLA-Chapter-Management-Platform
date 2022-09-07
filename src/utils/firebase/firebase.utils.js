import { initializeApp } from "firebase/app";

import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import {
    getFirestore,
    query,
    getDocs,
    getDoc,
    collection,
    where,
    addDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
} from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";

import APPLICATION_VARIABLES from '../../settings';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const functions = getFunctions();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});

export const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
            });
        }
    } catch (err) {
        console.error(err);
        //alert(err.message);
    }
};

export const logInWithEmailAndPassword = async (email, password) => {
    // try {
    await signInWithEmailAndPassword(auth, email, password);
    // } catch (err) {
    //     console.error(err);
    //     alert(err.message);
    // }
};

export const registerWithEmailAndPassword = async (name, email, password, phoneNo, studentNum, grade, role = "member") => {
    // try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        const uid = user.uid;
        const authProvider = 'local';

        createUserDoc({ uid, name, authProvider, email, role, phoneNo, studentNum, grade });
        
    // } catch (err) {
    //     console.error(err);
    //     alert(err.message);
    // }
};

export const sendPasswordReset = async (email) => {
    // try {
    await sendPasswordResetEmail(auth, email);
        //alert("Password reset link sent!");
    // } catch (err) {
    //     console.error(err);
    //     alert(err.message);
    // }
};

export const logout = () => signOut(auth);

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);

export const getUserMetadata = async (user) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const doc = await getDocs(q);
        const data = doc.docs[0].data();
        return data;
    } catch (error) {
        console.error(error);
    }
};

export const getEventsList = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "events"));

        return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
    } catch (error) {
        console.error(error);
    }
};

export const getUsersList = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        
        return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
    } catch (error) {
        console.log(error);
    }
};

export const getSignupsList = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "signups"));
        // var signups = {};

        // querySnapshot.docs.forEach((docSnapshot) => {
        //     signups[docSnapshot.id] = docSnapshot.data()
        // })

        // return signups;
       return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
    } catch (error) {
        console.log(error);
    }
};

export const getPaidMembersList = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "paid_members"));
        
        return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
    } catch (error) {
        console.log(error);
    }
};

export const getMeetingsList = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "meetings"));
        
        return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
    } catch (error) {
        console.log(error);
    }
};

export const getDBStore = async () => {
    try {
        const docSnap = await getDoc(doc(db, "db_store", "db_store"));
        
        return docSnap.data();
    } catch (error) {
        console.error(error);
    }
};

export const postToDBStore = async ({signupToggle, signupConf, signupDate}) => {   
    await updateDoc(doc(db, "db_store", "db_store"), {
        signupToggle,
        signupConf,
        signupDate,
    });
};

export const postSignupDateToDBStore = async (signupDate) => {
    await updateDoc(doc(db, "db_store", "db_store"), {
        signupDate,
    });
}

export const postCompetitorsVisibleToDBStore = async (value) => {
    await updateDoc(doc(db, "db_store", "db_store"), {
        otherCompetitorsVisible: value,
    });
};

export const postEventResourcesURL = async (new_URL) => {
    await updateDoc(doc(db, "db_store", "db_store"), {
        eventResourcesURL: new_URL,
    });
};

export const postMeetingURL = async (id, new_URL) => {
    await updateDoc(doc(db, "meetings", id), {
        url: new_URL,
    });
};

export const createNewEventDoc = async (eventDoc) => {
    await setDoc(doc(db, "events", eventDoc.Name), {
        Category: eventDoc.Category,
        TeamMemberLimit: eventDoc.TeamMemberLimit,
        Conference: eventDoc.Conference,
        IntroEvent: eventDoc.IntroEvent,
        Name: eventDoc.Name,
        TeamEvent: eventDoc.TeamEvent,
        Group: eventDoc.Group,
        CompetitorLimit: eventDoc.CompetitorLimit,
    });
};

export const updateEventDoc = async (eventDoc) => {
    await updateDoc(doc(db, "events", eventDoc.Name), {
        Category: eventDoc.Category,
        TeamMemberLimit: eventDoc.TeamMemberLimit,
        Conference: eventDoc.Conference,
        IntroEvent: eventDoc.IntroEvent,
        Name: eventDoc.Name,
        TeamEvent: eventDoc.TeamEvent,
        Group: eventDoc.Group,
        CompetitorLimit: eventDoc.CompetitorLimit,
    });
};

export const deleteEventDoc = async (eventName) => {
    await deleteDoc(doc(db, "events", eventName));
};

export const createNewSignupDoc = async (signupDoc, additionalSignups) => {
    await setDoc(doc(db, "signups", signupDoc.docID), {
        eventName: signupDoc.eventName,
        member1: signupDoc.member1,
        member2: signupDoc.member2,
        member3: signupDoc.member3,
        member4: signupDoc.member4,
        member5: signupDoc.member5,
        conf: signupDoc.conf,
        id: signupDoc.id,
        promotedToSLC: false,
        inHouseRequired: signupDoc.inHouseRequired,
    });

    if (signupDoc.inHouseRequired && additionalSignups) {
        for (const signup of additionalSignups) {
            await updateDoc(doc(db, "signups", signup.id), {
                inHouseRequired: true,
            });
        }
    }
};

export const updateSignupDoc = async (signupDoc) => {
    const res = await updateDoc(doc(db, "signups", signupDoc.id), {
        member1: signupDoc.member1,
        member2: signupDoc.member2,
        member3: signupDoc.member3,
        member4: signupDoc.member4,
        member5: signupDoc.member5,
    });

    return res;
};

export const promoteSignupDocToSLC = async (docID) => {
    await updateDoc(doc(db, "signups", docID), {
        conf: "SLC",
        promotedToSLC: true,
    });
};

export const demoteSignupDoc = async (docID, conf) => {
    await updateDoc(doc(db, "signups", docID), {
        conf,
        promotedToSLC: false,
    });
};

export const deleteSignupDoc = async (signupDoc, additionalSignups) => {
    await deleteDoc(doc(db, "signups", signupDoc.id));

    if (signupDoc.inHouseRequired && additionalSignups) {
        for (const signup of additionalSignups) {
            if (signup.id !== signupDoc.id) {
                await updateDoc(doc(db, "signups", signup.id), {
                    inHouseRequired: false,
                });
            }
        }
    }
};

export const deleteAllSignups = async () => {
    const signups = await getSignupsList();

    for (const signup of signups.values()) {
        await deleteDoc(doc(db, "signups", signup.id));
    }
};

// export const deleteAuthUser = async () => {
//     // Call to deleteUser serverless function
// };

export const createAuthUserFB = async (email, password, displayName) => {
    const createAuthUser = httpsCallable(functions, 'createAuthUser');
    var uid = "";

    await createAuthUser({ email, password, displayName })
    .then(async (user) => {                  
        uid = user.data.response.uid;
        
        await sendPasswordReset(email);
        
    })
    .catch(console.error);

    return uid;
};

export const createUserDoc = async (data) => {
    const { uid, name, authProvider, email, role, phoneNo, studentNum, grade } = data;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    await setDoc(doc(db, "users", email), {
        uid,
        name,
        authProvider,
        email,
        role,
        phoneNo,
        studentNum,
        grade,
        createdAt,
        updatedAt,
        paidMember: true,
    });

};

export const updateUserDoc = async (userDoc) => {
    const updatedAt = new Date();

    await updateDoc(doc(db, "users", userDoc.email), {
        grade: userDoc.grade,
        name: userDoc.name,
        phoneNo: userDoc.phoneNo,
        role: userDoc.role,
        studentNum: userDoc.studentNum,
        updatedAt,
    });
};

export const updateUserDocPaidMemberBool = async (email, paidMember) => {
    await updateDoc(doc(db, "users", email), {
        paidMember,
    });
};

export const deleteUserDoc = async (email) => {
    await deleteDoc(doc(db, "users", email));
};

export const createPaidMemberDoc = async (data) => {
    const { name, email, studentNum } = data;
    
    await setDoc(doc(db, "paid_members", studentNum), {
        name,
        email,
        studentNum,
        createdAccount: false,
    }).then(async () => {
        const exsistingDocSnap = await getDoc(doc(db, "users", email));

        if (exsistingDocSnap.exists()) {
            await updateUserDocPaidMemberBool(email, true);

            await updatePaidMemberCreatedAccountBool(studentNum, true);
        }
    })
};

export const updatePaidMemberDoc = async (memberDoc) => {
    await updateDoc(doc(db, "paid_members", memberDoc.studentNum), {
        email: memberDoc.email,
        name: memberDoc.name,
        studentNum: memberDoc.studentNum,
    });
};

export const updatePaidMemberCreatedAccountBool = async (studentNum, createdAccount) => {
    await updateDoc(doc(db, "paid_members", studentNum), {
        createdAccount,
    });
};

export const deletePaidMemberDoc = async (studentNum) => {
    await deleteDoc(doc(db, "paid_members", studentNum));
};

export const deleteAllPaidMembers = async () => {
    const paidMembers = await getPaidMembersList();

    for (const paidMember of paidMembers.values()) {
        await deleteDoc(doc(db, "paid_members", paidMember.studentNum));

        const exsistingDocSnap = await getDoc(doc(db, "users", paidMember.email));

        if (exsistingDocSnap.exists()) {
            await updateUserDocPaidMemberBool(paidMember.email, false);
        }
    }
};

export const createNewMeetingDoc = async ({name, date, start_time, end_time, code, attendees, attendanceToggle, id, flag}) => {
    await setDoc(doc(db, "meetings", id), {
        name,
        date,
        start_time,
        end_time,
        code,
        attendees,
        attendanceToggle,
        id,
        flag
    })
};

export const deleteMeetingDoc = async (meetingID) => {
    await deleteDoc(doc(db, "meetings", meetingID));
};

export const updateMeetingsAttendanceToggleBool = async (id, toggleVal) => {
    await updateDoc(doc(db, "meetings", id), {
        attendanceToggle: toggleVal,
    });
};

export const updateMeetingAttendance = async (id, new_attendees) => {
    await updateDoc(doc(db, "meetings", id), {
        attendees: new_attendees,
    });
}

export const deleteAllMeetings = async () => {
    const meetings = await getMeetingsList();
    var batchDocs = [];

    for (const meeting of meetings.values()) {
        batchDocs.push(meeting.id);
    }

    const batch = writeBatch(db);

    batchDocs.forEach(id => {
        const docRef = doc(db, "meetings", id);
        batch.delete(docRef);
    });

    await batch.commit();
};

export const downloadCollection = async (collectionID) => {
    const myCollection = collection(db, collectionID);
    const data = await getDocs(myCollection);
    return data.docs.map((doc) => ({...doc.data(), id: doc.id}));
};

export const handleEventsCSVDataUpload = async (fileData) => {
    const data = fileData.data;
    
    delete data[0];

    var FIREBASE_EVENTS_DOC_TEMPLATE = {
        Name: '',
        Category: '',
        Conference: '',
        Group: '',
        IntroEvent: false,
        TeamEvent: false,
        TeamMemberLimit: '',
        CompetitorLimit: '',
    };

    var batchDocs = [];
    const category_options = ["Testing", "Performance", "Prejudged", "Case Study"];
    const conf_options = ["FLC", "RLC", "SLC"];
    const team_options = ["No Team", "3", "5"];
    const group_options = ["A", "B", "C"];
    const competitor_limit_options = ["none", "1", "2", "3", "4", "5"];

    Object.entries(data).forEach(doc => {
        if(doc[1].length === 8){
            const Name = doc[1][0];
            const Category = doc[1][1];
            const Conference = doc[1][2];
            const Group = doc[1][3];
            const IntroEvent = doc[1][4];
            const TeamEvent = doc[1][5];
            const TeamMemberLimit = doc[1][6];
            const CompetitorLimit = doc[1][7];

            if (category_options.indexOf(Category) > -1  && conf_options.indexOf(Conference) > -1 && team_options.indexOf(TeamMemberLimit) > -1 && group_options.indexOf(Group) > -1 && competitor_limit_options.indexOf(CompetitorLimit) > -1) {
                if(doc[1].includes('')) {
            
                } else {
                    FIREBASE_EVENTS_DOC_TEMPLATE = {
                        Name,
                        Category,
                        Conference,
                        Group,
                        IntroEvent: (IntroEvent.toLowerCase() === 'true'),
                        TeamEvent: (TeamEvent.toLowerCase() === 'true'),
                        TeamMemberLimit,
                        CompetitorLimit,
                    };
                    batchDocs.push(FIREBASE_EVENTS_DOC_TEMPLATE);
                }
            }
        }
    })

    const batch = writeBatch(db);

    batchDocs.forEach(docData => {
        const docRef = doc(db, "events", docData.Name);
        batch.set(docRef, docData);
    });

    await batch.commit();
};

export const handlePaidMembersCSVDataUpload = async (fileData) => {
    const data = fileData.data;
    
    delete data[0];

    var FIREBASE_PAID_MEMBERS_DOC_TEMPLATE = {
        studentNum: '',
        name: '',
        email: '',
        createdAccount: false,
    };

    var batchDocs = [];
    var usersBatchDocs = [];

    for (const docData of Object.entries(data)) {
        if(docData[1].length === 3){
            if(docData[1].includes('')) {
            
            } else {
                
                const exsistingDocSnap = await getDoc(doc(db, "users", docData[1][2]));
                const lowerCaseEmail = docData[1][2].toLowerCase();

                if (exsistingDocSnap.exists()) {
                    FIREBASE_PAID_MEMBERS_DOC_TEMPLATE = {
                        studentNum: docData[1][0],
                        name: docData[1][1],
                        email: lowerCaseEmail,
                        createdAccount: true,
                    };

                    const FIREBASE_USERS_DOC_TEMPLATE = {
                        email: lowerCaseEmail,
                        paidMember: true,
                    };

                    usersBatchDocs.push(FIREBASE_USERS_DOC_TEMPLATE);
                } else {
                    FIREBASE_PAID_MEMBERS_DOC_TEMPLATE = {
                        studentNum: docData[1][0],
                        name: docData[1][1],
                        email: lowerCaseEmail,
                        createdAccount: false,
                    };
                }

                batchDocs.push(FIREBASE_PAID_MEMBERS_DOC_TEMPLATE);
            }
        }
    }

    const paidMembersBatch = writeBatch(db);
    const UsersBatch = writeBatch(db);

    batchDocs.forEach(docData => {
        const docRef = doc(db, "paid_members", docData.studentNum);
        paidMembersBatch.set(docRef, docData);
    });

    await paidMembersBatch.commit();

    usersBatchDocs.forEach(userDocData => {
        const docRef = doc(db, "users", userDocData.email);
        UsersBatch.update(docRef, userDocData);
    });

    await UsersBatch.commit();
};

export const handleUsersCSVDataUpload = async (fileData) => {
    const data = fileData.data;
    
    delete data[0];

    var FIREBASE_USERS_DOC_TEMPLATE = {
        role: "",
        name: "",
        grade: "",
        email: "",
        studentNum: "",
        phoneNo: "",
        authProvider: "local",
        paidMember: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        uid: "",
    };

    const role_options = ["member", "officer"];
    const grade_options = ["9", "10", "11", "12"];

    var usersBatchDocs = [];
    var paidMembersBatchDocs = [];

    for (const docData of Object.entries(data)) {
        if(docData[1].length === 6){
            if (role_options.indexOf(docData[1][0]) > -1 && grade_options.indexOf(docData[1][2]) > -1) {
                if(docData[1].includes('')) {
                
                } else {
                    
                    const exsistingPaidMemberDocSnap = await getDoc(doc(db, "paid_members", docData[1][4]));

                    const email = docData[1][3].toLowerCase();
                    const password = APPLICATION_VARIABLES.DEFAULT_PASSWORD;
                    const name = docData[1][1];

                    const uid = await createAuthUserFB(email, password, name);

                    if (exsistingPaidMemberDocSnap.exists()) {
                        var FIREBASE_PAID_MEMBERS_DOC_TEMPLATE = {
                            studentNum: docData[1][4],
                            name: docData[1][1],
                            email: email,
                            createdAccount: true,
                        };

                        FIREBASE_USERS_DOC_TEMPLATE = {
                            role: docData[1][0],
                            name: docData[1][1],
                            grade: docData[1][2],
                            email: email,
                            studentNum: docData[1][4],
                            phoneNo: docData[1][5],
                            authProvider: "local",
                            paidMember: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            uid,
                        };

                        paidMembersBatchDocs.push(FIREBASE_PAID_MEMBERS_DOC_TEMPLATE);
                    } else {
                        FIREBASE_USERS_DOC_TEMPLATE = {
                            role: docData[1][0],
                            name: docData[1][1],
                            grade: docData[1][2],
                            email: email,
                            studentNum: docData[1][4],
                            phoneNo: docData[1][5],
                            authProvider: "local",
                            paidMember: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            uid,
                        };
                    }

                    usersBatchDocs.push(FIREBASE_USERS_DOC_TEMPLATE);
                }
            }
        }
    }

    const usersBatch = writeBatch(db);
    const paidMembersBatch = writeBatch(db);

    usersBatchDocs.forEach(userDocData => {
        const docRef = doc(db, "users", userDocData.email);
        usersBatch.set(docRef, userDocData);
    });

    await usersBatch.commit();

    paidMembersBatchDocs.forEach(docData => {
        const docRef = doc(db, "paid_members", docData.studentNum);
        paidMembersBatch.update(docRef, docData);
    });

    await paidMembersBatch.commit();
};

export const handleSignupsPromotionCSVDataUpload = async (fileData, master_events) => {
    const data = fileData.data;

    delete data[0];

    var FIREBASE_SIGNUPS_DOC_TEMPLATE = {
        conf: "",
        id: "",
        promotedToSLC: false,
    };

    const promoted_options = ["false", "true"];

    var signupsBatchDocs = [];

    for (const docData of Object.entries(data)) {
        var row_conf = docData[1][1];
        var row_id = docData[1][8];
        var row_eventName = docData[1][0];
        var row_promotedToSLC = docData[1][7];

        if(docData[1].length === 10){
            if (promoted_options.indexOf(row_promotedToSLC.toLowerCase()) > -1) {

                if (row_promotedToSLC.toLowerCase() === "true") {
                    FIREBASE_SIGNUPS_DOC_TEMPLATE = {
                        conf: "SLC",
                        id: row_id,
                        promotedToSLC: true,
                    };
                } else {
                    // if (row_conf !== "SLC") {var conf = row_conf}
                    // else {
                    //     var filtered_event = master_events.find((event) => event.Name === row_eventName);
                    //     var conf = filtered_event.Conference;
                    // };

                    FIREBASE_SIGNUPS_DOC_TEMPLATE = {
                        conf: row_conf,
                        id: row_id,
                        promotedToSLC: false,
                    };
                }
               
                signupsBatchDocs.push(FIREBASE_SIGNUPS_DOC_TEMPLATE);
            }
        }
    }

    const signupsPromotionBatch = writeBatch(db);

    signupsBatchDocs.forEach(signupDocData => {
        const docRef = doc(db, "signups", signupDocData.id);
        signupsPromotionBatch.update(docRef, signupDocData);
    });

    await signupsPromotionBatch.commit();
};

// CALENDAR FUNCTIONS

export const addEventToDBCalendar = async (eventDoc) => {
    const docSnap = await getDoc(doc(db, "db_store", "db_store"));
    var docData = docSnap.data();

    await updateDoc(doc(db, "db_store", "db_store"), {
        calendar_events: [...docData.calendar_events, eventDoc],
    });
};

export const deleteEventFromDBCalendar = async (eventID) => {
    const docSnap = await getDoc(doc(db, "db_store", "db_store"));
    var docDataEvents = docSnap.data().calendar_events;

    var newCalendarEvents = [];

    for (const existingEvent of docDataEvents) {
        if (existingEvent.id !== eventID) {
            newCalendarEvents.push(existingEvent);
        }
    }

    await updateDoc(doc(db, "db_store", "db_store"), {
        calendar_events: newCalendarEvents,
    });
};

// Chapter Info Functions

export const addQuickLinkToDB = async (quickLinkDoc) => {
    const docSnap = await getDoc(doc(db, "db_store", "quick_links"));
    var docData = docSnap.data();

    await updateDoc(doc(db, "db_store", "quick_links"), {
        quick_links: [...docData.quick_links, quickLinkDoc],
    });
};

export const deleteQuickLinkFromDB = async (linkID) => {
    const docSnap = await getDoc(doc(db, "db_store", "quick_links"));
    var docDataLink = docSnap.data().quick_links;

    var newLinks = [];

    for (const existingLink of docDataLink) {
        if (existingLink.id !== linkID) {
            newLinks.push(existingLink);
        }
    }

    await updateDoc(doc(db, "db_store", "quick_links"), {
        quick_links: newLinks,
    });
};

// RESET SYSTEM FUNCTIONS

export const updateGradesForNewYear = async () => {
    const users = await getUsersList();

    for (const user of users.values()) {
        if (user.grade === "0") {

        } else if (user.grade === "12") {
            const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');

            const uid = user.uid;
            const email = user.email;

            await deleteAuthUser(uid).catch(console.error);

            await deleteUserDoc(email);
        } else {
            const updatedAt = new Date();
            const newGrade = (parseInt(user.grade) + 1).toString();
            
            await updateDoc(doc(db, "users", user.email), {
                grade: newGrade,
                updatedAt,
            });
        }
    }
};

export const deleteALLMailLogs = async () => {
    const querySnapshot = await getDocs(collection(db, "mail"));
    const mailLogs = await querySnapshot.docs.map((docSnapshot) => docSnapshot.id);

    for (const mail_log of mailLogs.values()) {
        await deleteDoc(doc(db, "mail", mail_log));
    }
};

export const moveMeetingsToCalendarData = async () => {
    const meetingsData = await getMeetingsList();

    for (const meeting of meetingsData.values()) {
        const newCalendarMeeting = {
            title: meeting.name,
            start: `${meeting.date}T${meeting.start_time}`,
            end: `${meeting.date}T${meeting.end_time}`,
            id: meeting.id,
            flag: 'meeting',
        }
        
        await addEventToDBCalendar(newCalendarMeeting);
    }
};

export const deleteALLMeetings = async () => {
    const querySnapshot = await getDocs(collection(db, "meetings"));
    const meetings_data = await querySnapshot.docs.map((docSnapshot) => docSnapshot.id);

    for (const meetingDoc of meetings_data.values()) {
        await deleteDoc(doc(db, "meetings", meetingDoc));
    }
};

export const resetSystem = async () => {
    await deleteAllSignups();
    await deleteAllPaidMembers();
    await deleteALLMailLogs();

    await updateGradesForNewYear();
    await moveMeetingsToCalendarData();
    await deleteALLMeetings();
};

// Creation Functions

export const checkIfNewSystem = async () => {
    const exsistingDocSnap = await getDoc(doc(db, "db_store", "db_store"));

    return exsistingDocSnap.exists();
}

export const createDBStore = async () => {
    await setDoc(doc(db, "db_store", "db_store"), {
        calendar_events: [],
        eventResourcesURL: "",
        otherCompetitorsVisible: false,
        signupConf: "",
        signupDate: "",
        signupToggle: false,
    })
};

export const createDeletedEmailTemplates = async () => {
    await setDoc(doc(db, "email_templates", "deletedEvent_emailTemplate"), {
    html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{deletorName}}</strong> has left your team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team was...</p> <p>1. {{deletorName}}</p> <p>2. {{oldMember2}}</p> <p>3. {{oldMember3}}</p> <p>4. {{oldMember4}}</p> <p>5. {{oldMember5}}</p> <br /> <p>The team now is...</p> <p>1. {{newMember2}}</p> <p>2. {{newMember3}}</p> <p>3. {{newMember4}}</p> <p>4. {{newMember5}}</p> <p>5. </p> <br /> <p>If you believe this was by mistake, please contact <strong>{{deletorName}}</strong> or the <strong>{{chapterName}}</strong> team.</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
    subject: "{{deletorName}} has left your event team"
    })
};

export const createEditedEmailTemplates = async () => {
    await setDoc(doc(db, "email_templates", "editedEvent_emailTemplate"), {
    html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{editorName}}</strong> has edited your team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team was...</p> <p>1. {{editorName}}</p> <p>2. {{oldMember2}}</p> <p>3. {{oldMember3}}</p> <p>4. {{oldMember4}}</p> <p>5. {{oldMember5}}</p> <br /> <p>The team now is...</p> <p>1. {{editorName}}</p> <p>2. {{newMember2}}</p> <p>3. {{newMember3}}</p> <p>4. {{newMember4}}</p> <p>5. {{newMember5}}</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
    subject: "{{editorName}} has EDITED event team"
    })
};

export const createCreatedEmailTemplates = async () => {
    await setDoc(doc(db, "email_templates", "submittedNewEvent_emailTemplate"), {
    html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{adderName}}</strong> has created a new team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team is...</p> <p>1. {{adderName}}</p> <p>2. {{added2}}</p> <p>3. {{added3}}</p> <p>4. {{added4}}</p> <p>5. {{added5}}</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
    subject: "{{adderName}} has CREATED new event team"
    })
};
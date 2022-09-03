import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router";
import { getFunctions, httpsCallable } from "firebase/functions";

import { auth, sendPasswordReset, updateUserDoc, createUserDoc, deleteUserDoc, updatePaidMemberCreatedAccountBool } from "../../utils/firebase/firebase.utils";

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectUsersList, selectUsersListIsLoading } from '../../store/users_list/users-list.selector';
import { selectPaidMembersList, selectPaidMembersListIsLoading } from '../../store/paid_members/paid_members.selector';
import { fetchPaidMembersStartAsync } from '../../store/paid_members/paid_members.action';
import { fetchUsersListStartAsync } from '../../store/users_list/users-list.action';

import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    FloatingLabel,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Header from "../../components/Header/header.component";
import SmallSpinner from '../../components/SmallSpinner/small-spinner.component';
import Spinner from '../../components/Spinner/spinner.component';
import DownloadFile from '../../components/DownloadFile/download-file.component';

import UploadCSVModal from '../../components/UploadCSV/upload-csv.component';

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

const defaultCurrentUserFields = {
    authProvider: "local",
    email: "",
    grade: "",
    name: "",
    phoneNo: "",
    role: "",
    studentNum: "",
    uid: "",
    paidMember: false,
};

const UserList = () => {
    const [user, loading, error] = useAuthState(auth);
    const [showAddEditForm, setShowAddEditForm] = useState(false);
    const [addEditFormType, setAddEditFormType] = useState("Add"); //Add, Edit
    const [validated, setValidated] = useState(false);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [currentUser, setCurrentUser] = useState(defaultCurrentUserFields);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [users, setUsers] = useState();
    const [selectedRadio, setSelectedRadio] = useState("student");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const functions = getFunctions();

    const { role } = useSelector(selectCurrentUser);

    const users_data = useSelector(selectUsersList);
    const isUsersListLoading = useSelector(selectUsersListIsLoading);

    const paid_members = useSelector(selectPaidMembersList);
    const isPaidMembersLoading = useSelector(selectPaidMembersListIsLoading);

    const DEFAULT_PASSWORD = APPLICATION_VARIABLES.DEFAULT_PASSWORD;

    useEffect(() => {
        dispatch(fetchPaidMembersStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchUsersListStartAsync());
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
    }, [user, loading]);

    useEffect(() => {
        const usersSortOrder = {'adviser': 1, 'officer': 2, 'member': 3};

        const sortedUsers = users_data.sort((a, b) => (usersSortOrder[a.role] > usersSortOrder[b.role]) ? 1 : (a.role === b.role) ? ((a.name > b.name) ? 1 : -1) : -1);

        setUsers(sortedUsers);
    }, [users_data]);

    const handleModalClose = () => {
        setCurrentUser(defaultCurrentUserFields);
        setShowAddEditForm(false);
        setShowDeleteDialogue(false);
        setSelectedRadio("student");
    };

    const handleAddEditFormSubmit = async (e) => {
        e.preventDefault();

        const {
            userEmail,
            userGrade,
            userName,
            userPhoneNo,
            userRole,
            userStudentNum,
            adviserEmail,
            adviserName,
        } = e.target.elements;

        // if (
        //     userEmail.value &&
        //     userGrade.value &&
        //     userName.value &&
        //     userPhoneNo.value &&
        //     userRole.value &&
        //     userStudentNum.value &&
        //     adviserEmail.value &&
        //     adviserName.value
        // ) {
            if (selectedRadio === "student") {
                var email = userEmail.value;
                var password = DEFAULT_PASSWORD;
                var displayName = userName.value;
                var authProvider = 'local';
                var role = userRole.value;
                var phoneNo = userPhoneNo.value;
                var studentNum = userStudentNum.value;
                var grade = userGrade.value;
                var name = userName.value;
            } else if (selectedRadio === "adviser") {
                var email = adviserEmail.value;
                var password = DEFAULT_PASSWORD;
                var displayName = adviserName.value;
                var authProvider = 'local';
                var role = "adviser";
                var phoneNo = "0000000000";
                var studentNum = "000000";
                var grade = "0";
                var name = adviserName.value;
            }

            if (addEditFormType === "Add") {
                // CLOUD FUNCTIONS: https://stackoverflow.com/questions/37517208/firebase-kicks-out-current-user

                var user_emails = [];
                for (const userDoc of users_data) {
                    user_emails.push(userDoc.email);
                }   

                if (user_emails.indexOf(email) === -1) {

                    setShowSpinner(true);

                    const createAuthUser = httpsCallable(functions, 'createAuthUser');
                    
                    createAuthUser({ email, password, displayName })
                    .then((user) => {                  
                        const uid = user.data.response.uid;
                        
                        createUserDoc({ uid, name, authProvider, email, role, phoneNo, studentNum, grade }).then(() => {
                            if (selectedRadio !== "adviser") {
                                updatePaidMemberCreatedAccountBool(studentNum, true).then(() => {
                                    sendPasswordReset(email).then(() => {
                                        setShowSpinner(false);
                                        window.location.reload(false);
                                    })
                                });
                            } else {
                                sendPasswordReset(email).then(() => {
                                    setShowSpinner(false);
                                    window.location.reload(false);
                                })
                            }
                        });


                    })
                    .catch((error) => {
                        setShowSpinner(false);
                        toast.error("Could not create account", TOAST_PROPS);
                        console.error(error)
                    });

                } else {
                    toast.error('Account already exsists', TOAST_PROPS);
                }

                handleModalClose();
            } else if (addEditFormType === "Edit") {             
                
                const userDoc = {
                    email,
                    grade,
                    name,
                    phoneNo,
                    role,
                    studentNum,
                };
        
                updateUserDoc(userDoc).then(() => {window.location.reload(false)});

                //alert(`${userEmail.value} is successfully updated.`);
                handleModalClose();
            }
        // }

        setValidated(true);
    };

    const handleEditShow = async (role) => {
        if (role === "adviser") {
            await setSelectedRadio("adviser");
        } else {
            await setSelectedRadio("student");
        }

        await setAddEditFormType("Edit");
        setShowAddEditForm(true);
    };

    const handleUserDelete = async (e) => {
        setShowSpinner(true);
        
        const deleteAuthUser = httpsCallable(functions, 'deleteAuthUser');

        const uid = currentUser.uid;
        const email = currentUser.email;
        const studentNum = currentUser.studentNum;

        deleteAuthUser(uid)
        .then(() => {
            deleteUserDoc(email).then(() => {
                if (currentUser.role !== "adviser") {
                updatePaidMemberCreatedAccountBool(studentNum, false).then(() => {
                    setShowSpinner(false);
                    window.location.reload(false);
                }).catch((error) => (console.log(error)));
                } else {
                    setShowSpinner(false);
                    window.location.reload(false);
                }
            });
        })
        .catch(console.error);

        //alert(`Deletion Successful`);
        handleModalClose();
    };

    const handleCSVModalClose = () => {
        setShowCSVUpload(false);
    };

    const handlePasswordResetEmail = async (email) => {
        await sendPasswordReset(email).then(() => {toast.success("Sent reset email successfully!", TOAST_PROPS)}).catch((error) => {toast.error("Could not send reset email!", TOAST_PROPS)});
    }

    return (
        <div>
            <Header />

            <UploadCSVModal type="users" showToggle={showCSVUpload} onHideHandler={handleCSVModalClose} />

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


        {(role !== 'member') && (<div>

            <Modal show={showSpinner} centered ><Modal.Body><><SmallSpinner /></></Modal.Body></Modal> 

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleUserDelete}>
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddEditForm} onHide={handleModalClose}>
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleAddEditFormSubmit}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {addEditFormType === "Add" ? "Add User" : "Edit"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {addEditFormType === "Add" && (
                        <>
                            <p>Default password for new users is <i>{DEFAULT_PASSWORD}</i>. Users will be sent an email to change their password.</p>
                            <hr />
                        </>
                        )}

                        <h6>User Type: </h6>

                        <Form.Check
                            inline
                            label="Student"
                            name="roleGroup"
                            type="radio"
                            id="student"
                            checked={selectedRadio === 'student'}
                            onChange={(e) => setSelectedRadio(e.target.id)}
                            disabled={addEditFormType === "Edit" && selectedRadio === 'adviser'}
                        />
                        <Form.Check
                            inline
                            label="Adviser"
                            name="roleGroup"
                            type="radio"
                            id="adviser"
                            checked={selectedRadio === 'adviser'}
                            onChange={(e) => setSelectedRadio(e.target.id)}
                            disabled={(addEditFormType === "Edit" && selectedRadio === 'student') || role !== "adviser"}
                        />

                        <hr />

                        {/* <FloatingLabel
                            controlId="userEmail"
                            label="User Email"
                            className="mb-3"
                        >
                            <Form.Control
                                required
                                disabled={addEditFormType === "Add" ? false : true}
                                type="text"
                                placeholder="Enter user's email"
                                size="md"
                                value={currentUser.email}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        email: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                User's email is required
                            </Form.Control.Feedback>
                        </FloatingLabel> */}

                        </Modal.Body>

                        { selectedRadio === "student" && (<>
                            <Modal.Body>

                            <FloatingLabel
                                controlId="userEmail"
                                label="Student Email"
                                className="mb-3"
                            >
                                <Form.Select
                                    required
                                    disabled={addEditFormType === "Add" ? false : true}
                                    size="md"
                                    value={currentUser.email}
                                    onChange={(e) => {
                                        const selected_paid_member = paid_members.filter((member) => member.email === e.target.value)[0];

                                        setCurrentUser({
                                            ...currentUser,
                                            email: e.target.value,
                                            name: selected_paid_member.name,
                                            studentNum: selected_paid_member.studentNum,
                                        });
                                    }}
                                >
                                    <option value="" disabled defaultValue hidden>
                                        {" "}
                                    </option>
                                    {(addEditFormType === "Edit") && <option value={currentUser.email} defaultValue>{currentUser.email}</option>}
                                    {(paid_members) && (paid_members.map((member, index) => {
                                        if (!member.createdAccount) {
                                            return (<option key={index} value={member.email}>
                                                {member.email}</option>)
                                        }
                                    }))}

                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Student's email is required
                                </Form.Control.Feedback>
                            </FloatingLabel>




                            <FloatingLabel
                                controlId="userName"
                                label="Student Name"
                                className="mb-3"
                            >
                                <Form.Select
                                    required
                                    size="md"
                                    value={currentUser.name}
                                    onChange={(e) => {
                                        const selected_paid_member = paid_members.filter((member) => member.name === e.target.value)[0];

                                        setCurrentUser({
                                            ...currentUser,
                                            name: e.target.value,
                                            studentNum: selected_paid_member.studentNum,
                                            email: selected_paid_member.email,
                                        });
                                    }}
                                >
                                    <option value="" disabled defaultValue hidden>
                                        {" "}
                                    </option>
                                    {(addEditFormType === "Edit") && <option value={currentUser.name} defaultValue>{currentUser.name}</option>}
                                    {(paid_members) && (paid_members.map((member, index) => {
                                        if (!member.createdAccount) {
                                            return (<option key={index} value={member.name}>
                                                {member.name}</option>)
                                        }
                                    }))}

                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Student's full name is required
                                </Form.Control.Feedback>
                            </FloatingLabel>


                            {/* <FloatingLabel
                                controlId="userName"
                                label="User Name"
                                className="mb-3"
                            >
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Enter user's full name"
                                    size="md"
                                    value={currentUser.name}
                                    onChange={(e) => {
                                        const selected_paid_member = paid_members.filter((member) => member.email === e.target.value);

                                        setCurrentUser({
                                            ...currentUser,
                                            name: e.target.value,
                                            email: selected_paid_member.email,
                                            studentNum: selected_paid_member.studentNum,
                                        });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    User's full name is required
                                </Form.Control.Feedback>
                            </FloatingLabel> */}



                            <FloatingLabel
                                controlId="userStudentNum"
                                label="Student Num"
                                className="mb-3"
                            >
                                <Form.Select
                                    required
                                    size="md"
                                    value={currentUser.studentNum}
                                    onChange={(e) => {
                                        const selected_paid_member = paid_members.filter((member) => member.studentNum === e.target.value)[0];

                                        setCurrentUser({
                                            ...currentUser,
                                            studentNum: e.target.value,
                                            name: selected_paid_member.name,
                                            email: selected_paid_member.email,
                                        });
                                    }}
                                >
                                    <option value="" disabled defaultValue hidden>
                                        {" "}
                                    </option>
                                    {(addEditFormType === "Edit") && <option value={currentUser.studentNum} defaultValue>{currentUser.studentNum}</option>}
                                    {(paid_members) && (paid_members.map((member, index) => {
                                        if (!member.createdAccount) {
                                            return (<option key={index} value={member.studentNum}>
                                                {member.studentNum}</option>)
                                        }
                                    }))}

                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Student's student num is required
                                </Form.Control.Feedback>
                            </FloatingLabel>



                            <FloatingLabel
                                controlId="userGrade"
                                label="Student Grade"
                                className="mb-3"
                            >
                                <Form.Select
                                    value={currentUser.grade}
                                    onChange={(e) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            grade: e.target.value,
                                        });
                                    }}
                                >
                                    <option value="" disabled defaultValue hidden>
                                        {" "}
                                    </option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="userPhoneNo"
                                label="Student Phone No"
                                className="mb-3"
                            >
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Enter student's phone no"
                                    size="md"
                                    value={currentUser.phoneNo}
                                    onChange={(e) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            phoneNo: e.target.value.replace(/[^+\d]+/g, ""),
                                        });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Student's phone no is required
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel
                                controlId="userRole"
                                label="Student Role"
                                className="mb-3"
                            >
                                <Form.Select
                                    value={currentUser.role}
                                    onChange={(e) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            role: e.target.value,
                                        });
                                    }}
                                >
                                    <option value="" disabled defaultValue hidden>
                                        {" "}
                                    </option>
                                    <option value="member">Member</option>
                                    <option value="officer">Officer</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button type="submit">
                                {addEditFormType === "Add" ? "Add" : "Update"}
                            </Button>
                        </Modal.Footer>

                    </>)}

                    {selectedRadio === "adviser" && (
                        <>
                        <Modal.Body>

                            <FloatingLabel
                                controlId="adviserEmail"
                                label="Adviser Email"
                                className="mb-3"
                            >
                                <Form.Control
                                    required
                                    disabled={addEditFormType === "Add" ? false : true}
                                    type="text"
                                    placeholder="Enter adviser's email"
                                    size="md"
                                    value={currentUser.email}
                                    onChange={(e) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            email: (e.target.value).toLowerCase(),
                                            role: 'adviser',
                                        });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Adviser's email is required
                                </Form.Control.Feedback>
                            </FloatingLabel>


                            <FloatingLabel
                                controlId="adviserName"
                                label="Adviser Name"
                                className="mb-3"
                            >
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Enter adviser's full name"
                                    size="md"
                                    value={currentUser.name}
                                    onChange={(e) => {
                                        setCurrentUser({
                                            ...currentUser,
                                            name: e.target.value,
                                            role: 'adviser',
                                        });
                                    }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Adviser's full name is required
                                </Form.Control.Feedback>
                            </FloatingLabel>

                            </Modal.Body>
                            <Modal.Footer>
                            <Button type="submit">
                                {addEditFormType === "Add" ? "Add" : "Update"}
                            </Button>
                            </Modal.Footer>
                        
                        </>
                    )}

                </Form>
            </Modal>

            {
                isUsersListLoading || isPaidMembersLoading ? <Spinner /> :

            <Card className="m-3 mx-5">
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                    <div className="align-items-center mr-8">
                        <h4 className="content-center" style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Users</h4>
                    </div>
                    <div>
                        {(role !== "member") && <DownloadFile data="users" />}
                        <Button
                            className="m-2"
                            variant="warning"
                            disabled={false}
                            onClick={() => {setShowCSVUpload(true)}}
                        >
                            Upload from CSV
                        </Button>
                        <Button
                            variant="dark"
                            disabled={false}
                            onClick={() => {
                                setShowAddEditForm(true);
                                setAddEditFormType("Add");
                            }}
                        >
                            Add New User
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive striped bordered>
                        <thead>
                            <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                                <th>#</th>
                                <th>Email</th>
                                <th>Full Name</th>
                                <th>Student Num</th>
                                <th>Grade</th>
                                <th>Phone No</th>
                                <th>Role</th>
                                <th>Paid for Current Year</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users &&
                                users.map((userItem, index) => (
                                    // TODO center text in row
                                    <tr key={index} className="">
                                        <td>{index + 1}</td>
                                        <td>{userItem.email}</td>
                                        <td>{userItem.name}</td>
                                        <td>{(userItem.studentNum==="000000") ? '-' : userItem.studentNum}</td>
                                        <td>{(userItem.grade==="0") ? '-' : userItem.grade}</td>
                                        <td>{(userItem.phoneNo==="0000000000") ? '-' : userItem.phoneNo}</td>
                                        <td>{userItem.role}</td>
                                        <td>{(userItem.paidMember===true) ? '✓' : '-'}</td>

                                        <td className="space-x-2">
                                            {auth.currentUser &&
                                                userItem.email !==
                                                    auth.currentUser.email && (userItem.role === "member" && role === "officer" || role === "adviser") && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={async () => {
                                                            await setCurrentUser({
                                                                authProvider:
                                                                    "local",
                                                                email: userItem.email,
                                                                grade: userItem.grade,
                                                                name: userItem.name,
                                                                phoneNo:
                                                                    userItem.phoneNo,
                                                                role: userItem.role,
                                                                studentNum:
                                                                    userItem.studentNum,
                                                                uid: userItem.uid,
                                                                paidMember: userItem.paidMember,
                                                            });

                                                            handlePasswordResetEmail(userItem.email);
                                                        }}
                                                    >
                                                        Reset Password
                                                    </Button>
                                                )}
                                            {auth.currentUser &&
                                                userItem.email !==
                                                    auth.currentUser.email && (userItem.role === "member" && role === "officer" || role === "adviser") && (
                                                    <Button
                                                    className="mx-2"    
                                                    variant="outline-primary"
                                                        onClick={async () => {

                                                            await setCurrentUser({
                                                                authProvider:
                                                                    "local",
                                                                email: userItem.email,
                                                                grade: userItem.grade,
                                                                name: userItem.name,
                                                                phoneNo:
                                                                    userItem.phoneNo,
                                                                role: userItem.role,
                                                                studentNum:
                                                                    userItem.studentNum,
                                                                uid: userItem.uid,
                                                                paidMember: userItem.paidMember,
                                                            });

                                                            handleEditShow(userItem.role);
                                                        }}
                                                    >
                                                        ✎ Edit
                                                    </Button>
                                                )}
                                            
                                            {auth.currentUser &&
                                                userItem.email !==
                                                    auth.currentUser.email && (userItem.role === "member" && role === "officer" || role === "adviser") && (
                                                    <Button
                                                        variant="outline-danger"
                                                        disabled={false}
                                                        onClick={() => {
                                                            setCurrentUser({
                                                                authProvider:
                                                                    "local",
                                                                email: userItem.email,
                                                                grade: userItem.grade,
                                                                name: userItem.name,
                                                                phoneNo:
                                                                    userItem.phoneNo,
                                                                role: userItem.role,
                                                                studentNum:
                                                                    userItem.studentNum,
                                                                uid: userItem.uid,
                                                                paidMember: userItem.paidMember,
                                                            });

                                                            setShowDeleteDialogue(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        x Delete
                                                    </Button>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    <p className="mt-3 text-sm text-slate-400">
                        Adviser Only Access
                    </p>
                </Card.Footer>
            </Card>
            }
        </div>)}
    </div>
    );
};

export default UserList;

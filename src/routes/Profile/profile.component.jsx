import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router";

import { auth, db, updateUserDoc } from "../../utils/firebase/firebase.utils";

import { selectCurrentUser } from '../../store/user/user.selector';

import {Card, FloatingLabel, Form, Button,} from "react-bootstrap";

import Header from '../../components/Header/header.component';

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

const Profile = () => {
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const { role, name, email, grade, phoneNo, studentNum, uid } = useSelector(selectCurrentUser);

    const [currentUser, setCurrentUser] = useState({
        authProvider: "local",
        email: "",
        grade: "",
        name: "",
        phoneNo: "",
        role: "",
        studentNum: "",
        uid: "",
    });

    useEffect(() => {
        // if (!user) return navigate("/");
        if (loading) return;
    }, [user, loading]);

    const handleAddEditFormSubmit = async (e) => {
        e.preventDefault();

        const userDoc = {
            email: currentUser.email,
            grade: currentUser.grade,
            name: currentUser.name,
            phoneNo: currentUser.phoneNo,
            role: currentUser.role,
            studentNum: currentUser.studentNum,
        };

        updateUserDoc(userDoc).then(() => {toast.success(`${currentUser.email} successfully updated.`, TOAST_PROPS)});
    };

    useEffect(() => {
        setCurrentUser({authProvider: "local",
            email: email,
            grade: grade,
            name: name,
            phoneNo: phoneNo,
            role: role,
            studentNum: studentNum,
            uid: uid
        });
    }, [role, name, email, grade, phoneNo, studentNum, uid]);

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

            <Card className="m-5 mx-auto" style={{ maxWidth: '25rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
                <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Profile for {currentUser.name}</Card.Header>
                <Card.Body>

                    <FloatingLabel
                        controlId="userEmail"
                        label="Email"
                        className="mb-3"
                        style={{textAlign: "left", width: "100%"}}
                    >
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter user's email"
                            size="md"
                            disabled={true}
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
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="userName"
                        label="Name"
                        className="mb-3"
                        style={{textAlign: "left", width: "100%"}}
                    >
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter user's full name"
                            size="md"
                            disabled={true}
                            value={currentUser.name}
                            onChange={(e) => {
                                setCurrentUser({
                                    ...currentUser,
                                    name: e.target.value,
                                });
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            User's full name is required
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    {role !== 'adviser' && (
                    <>
                        <FloatingLabel
                            controlId="userStudentNum"
                            label="Student Num"
                            className="mb-3"
                            style={{textAlign: "left", width: "100%"}}
                        >
                            <Form.Control
                                required
                                disabled={ currentUser.role === "adviser" ? false : true }
                                type="text"
                                placeholder="Enter user's student num"
                                size="md"
                                value={currentUser.studentNum}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        studentNum: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Student num is required
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        <FloatingLabel
                            controlId="userGrade"
                            label="Grade"
                            className="mb-3"
                            style={{textAlign: "left", width: "100%"}}
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
                                <option value="0" disabled hidden>0</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                            </Form.Select>
                        </FloatingLabel>

                        <FloatingLabel
                            controlId="userPhoneNo"
                            label="Phone No"
                            className="mb-3"
                            style={{textAlign: "left", width: "100%"}}
                        >
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter user's phone no"
                                size="md"
                                value={currentUser.phoneNo}
                                onChange={(e) => {
                                    setCurrentUser({
                                        ...currentUser,
                                        phoneNo: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                User's phone no is required
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </>)}

                    <Button type="submit" variant='secondary' onClick={handleAddEditFormSubmit}>Update</Button>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Profile;
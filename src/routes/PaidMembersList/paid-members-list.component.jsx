import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router";

import { auth, updatePaidMemberDoc, createPaidMemberDoc, deletePaidMemberDoc, updateUserDocPaidMemberBool, deleteAllPaidMembers } from "../../utils/firebase/firebase.utils";

import { fetchPaidMembersStartAsync } from '../../store/paid_members/paid_members.action';

import { selectCurrentUser } from '../../store/user/user.selector';
import { selectPaidMembersList, selectPaidMembersListIsLoading } from '../../store/paid_members/paid_members.selector';

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

const defaultCurrentPaidMemberFields = {
    createdAccount: false,
    email: "",
    studentNum: "",
    name: "",
};

const PaidMemberList = () => {
    const [user, loading, error] = useAuthState(auth);
    const [showAddEditForm, setShowAddEditForm] = useState(false);
    const [addEditFormType, setAddEditFormType] = useState("Add"); //Add, Edit
    const [validated, setValidated] = useState(false);
    const [showDeleteDialogue, setShowDeleteDialogue] = useState(false);
    const [currentPaidMember, setCurrentPaidMember] = useState(defaultCurrentPaidMemberFields);
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [allDeleteToggle, setAllDeleteToggle] = useState(false);
    const [showAllDeleteDialogue, setShowAllDeleteDialogue] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { role } = useSelector(selectCurrentUser);

    const paid_members = useSelector(selectPaidMembersList);
    const isPaidMembersListLoading = useSelector(selectPaidMembersListIsLoading);

    useEffect(() => {
        dispatch(fetchPaidMembersStartAsync());
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
    }, [user, loading]);

    const handleModalClose = () => {
        setCurrentPaidMember(defaultCurrentPaidMemberFields);
        setShowAddEditForm(false);
        setShowDeleteDialogue(false);
    };

    const handleAddEditFormSubmit = async (e) => {
        e.preventDefault();

        const {
            memberEmail,
            memberStudentNum,
            memberName,
        } = e.target.elements;

        if (
            memberEmail.value &&
            memberStudentNum.value &&
            memberName.value
        ) {
            if (addEditFormType === "Add") {

                var paid_member_student_nums = [];
                for (const paidMember of paid_members) {
                    paid_member_student_nums.push(paidMember.studentNum);
                }   

                const name = memberName.value;
                const studentNum = memberStudentNum.value;
                const email = memberEmail.value;

                if (paid_member_student_nums.indexOf(studentNum) === -1) {
                    createPaidMemberDoc({ name, email, studentNum }).then(() => {
                        window.location.reload(false);
                    });
                } else {
                    toast.error('Student already exsists', TOAST_PROPS);
                }

                handleModalClose();
            } else if (addEditFormType === "Edit") {
                
                const memberDoc = {
                    email: memberEmail.value,
                    studentNum: memberStudentNum.value,
                    name: memberName.value,
                };
        
                updatePaidMemberDoc(memberDoc).then(() => {window.location.reload(false)});

                //alert(`${userEmail.value} is successfully updated.`);
                handleModalClose();
            }
        }

        setValidated(true);
    };

    const handlePaidMemberDelete = async (e) => {

        const studentNum = currentPaidMember.studentNum;
        const email = currentPaidMember.email;

        deletePaidMemberDoc(studentNum).then(() => {
            updateUserDocPaidMemberBool(email, false).then(() => {
                window.location.reload(false);
            }).catch((error) => {
                window.location.reload(false);
            });
        });

        //alert(`Deletion Successful`);
        handleModalClose();
    };

    const handleCSVModalClose = () => {
        setShowCSVUpload(false);
    };

    const handleAllDeleteModalClose = () => {
        setCurrentPaidMember(defaultCurrentPaidMemberFields);
        setShowAddEditForm(false);
        setShowAllDeleteDialogue(false);
    }

    const handleAllPaidMembersDelete = async () => {
        await setShowSpinner(true);
        setShowAllDeleteDialogue(false);

        await deleteAllPaidMembers().then(() => {
            setShowSpinner(false);
            window.location.reload(false);
        });

        handleAllDeleteModalClose();
    }

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

            <UploadCSVModal type="paid_members" showToggle={showCSVUpload} onHideHandler={handleCSVModalClose} />

            <Modal show={showSpinner} centered ><Modal.Body><><SmallSpinner /></></Modal.Body></Modal> 


            {(role !== 'member') && (<div>

            <Modal show={showDeleteDialogue} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Paid Member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this paid member?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handlePaidMemberDelete}>
                        Yes, Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAllDeleteDialogue} onHide={handleAllDeleteModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete All Paid Members</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Are you sure you want to delete ALL paid members?</strong></p>
                    <p>Please first download the paid members as CSV before deletion.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAllDeleteModalClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleAllPaidMembersDelete}>Yes, Delete All</Button>
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
                            {addEditFormType === "Add" ? "Add Paid Member" : "Edit"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>


                        <FloatingLabel
                            controlId="memberStudentNum"
                            label="Member Student Num"
                            className="mb-3"
                        >
                            <Form.Control
                                required
                                disabled={addEditFormType === "Add" ? false : true}
                                type="text"
                                placeholder="Enter member's student num"
                                size="md"
                                value={currentPaidMember.studentNum}
                                onChange={(e) => {
                                    setCurrentPaidMember({
                                        ...currentPaidMember,
                                        studentNum: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Student num is required
                            </Form.Control.Feedback>
                        </FloatingLabel>
                        

                        <FloatingLabel
                            controlId="memberEmail"
                            label="Paid Member Email"
                            className="mb-3"
                        >
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter member's email"
                                size="md"
                                value={currentPaidMember.email}
                                onChange={(e) => {
                                    setCurrentPaidMember({
                                        ...currentPaidMember,
                                        email: (e.target.value).toLowerCase(),
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Member email is required
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        <FloatingLabel
                            controlId="memberName"
                            label="Member Name"
                            className="mb-3"
                        >
                            <Form.Control
                                required
                                type="text"
                                placeholder="Enter member's full name"
                                size="md"
                                value={currentPaidMember.name}
                                onChange={(e) => {
                                    setCurrentPaidMember({
                                        ...currentPaidMember,
                                        name: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Member's full name is required
                            </Form.Control.Feedback>
                        </FloatingLabel>

                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit">
                            {addEditFormType === "Add" ? "Add" : "Update"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {
                isPaidMembersListLoading ? <Spinner /> :

            <Card className="m-3 mx-5">
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>
                    <div className="align-items-center mr-8">
                        <h4 className="content-center" style={{ marginTop: 8, fontWeight: "bold" }}>{APPLICATION_VARIABLES.APP_NAME} | Paid Members</h4>
                    </div>
                    <div>
                        <DownloadFile data="paid_members" />
                        {role === 'adviser' && (<>
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
                            Add New Paid Member
                        </Button>
                        </>)}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive striped bordered>
                        <thead>
                            <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                                <th>#</th>
                                <th>Student Num</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Created Account</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paid_members &&
                                paid_members.map((userItem, index) => (
                                    // TODO center text in row
                                    <tr key={index} className="">
                                        <td>{index + 1}</td>
                                        <td>{userItem.studentNum}</td>
                                        <td>{userItem.name}</td>
                                        <td>{userItem.email}</td>
                                        <td>{(userItem.createdAccount===true) ? '✓' : '-'}</td>
                                    
                                        <td className="space-x-2">
                                                 {role === 'adviser' && (<>
                                                 <Button
                                                    className="me-1"
                                                    variant="outline-primary"
                                                        onClick={() => {
                                                            
                                                            setCurrentPaidMember({
                                                                email: userItem.email,
                                                                studentNum:
                                                                    userItem.studentNum,
                                                                name: userItem.name,
                                                            });

                                                            setAddEditFormType(
                                                                "Edit"
                                                            );
                                                            setShowAddEditForm(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        ✎ Edit
                                                    </Button>

                                                    <Button
                                                        variant="outline-danger"
                                                        disabled={false}
                                                        onClick={() => {
                                                            setCurrentPaidMember({
                                                                email: userItem.email,
                                                                studentNum:
                                                                    userItem.studentNum,
                                                                name: userItem.name,
                                                            });

                                                            setShowDeleteDialogue(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        x Delete
                                                    </Button>
                                                </>)}                                               
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                    {(role === "adviser") && <p className="mt-3 text-sm text-slate-400">Adviser Only Access</p>}
                    {(role === "officer") && <p className="mt-3 text-sm text-slate-400">Officer Only Access</p>}
                    {role === 'adviser' && (<div className="d-flex justify-content-between align-items-center text-right pull-right">
                        <Form>
                            <Form.Check 
                                type="switch"
                                id="allDeleteToggle"
                                label=""
                                onChange={(e) => setAllDeleteToggle(e.target.checked)}
                            />
                        </Form>
                        <Button className="ms-2" variant="danger" disabled={!allDeleteToggle} onClick={() => {setShowAllDeleteDialogue(true)}}>Delete All Paid Members</Button>
                    </div>)}
                </Card.Footer>
            </Card>
            }
        </div>)}
    </div>
    );
};

export default PaidMemberList;
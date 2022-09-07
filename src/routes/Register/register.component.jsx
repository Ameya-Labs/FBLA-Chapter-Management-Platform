import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate  } from "react-router-dom";
import {
    auth,
    registerWithEmailAndPassword,
    signInWithGoogle,
    updatePaidMemberCreatedAccountBool,
} from "../../utils/firebase/firebase.utils";

import { fetchPaidMembersStartAsync } from '../../store/paid_members/paid_members.action';

import { selectPaidMembersList } from '../../store/paid_members/paid_members.selector';

import LandingHeader from '../../components/LandingHeader/landing-header.component';

import "./register.styles.scss";

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

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [studentNum, setStudentNum] = useState("");
    const [grade, setGrade] = useState("");
    const [user, loading, error] = useAuthState(auth);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const paid_members = useSelector(selectPaidMembersList);

    useEffect(() => {
        dispatch(fetchPaidMembersStartAsync());
    }, []);

    const register = async (event) => {
        event.preventDefault();

        if (password === confirmPassword) {
            const paidStudentNums = paid_members.map((member) => member.studentNum);
            const paidEmails = paid_members.map((member) => member.email);

            if (paidStudentNums.indexOf(studentNum) > -1 && paidEmails.indexOf(email) > -1) {
                await registerWithEmailAndPassword(name, email, password, phoneNo, studentNum, grade).then(() => {
                    updatePaidMemberCreatedAccountBool(studentNum, true).then(() => {toast.success("Successfully registered!", TOAST_PROPS)});
                }).catch((error) => {
                    switch(error.code) {
                        case "auth/email-already-in-use":
                            toast.error('Account already exists.', TOAST_PROPS);
                            break
                        default:
                            toast.error("Error with registering. Please try again later.", TOAST_PROPS);
                            break;
                    }
                });
            } else {
                toast.error("Not a currently paid member. Please see an adviser.", TOAST_PROPS);
            }
        } else {
          toast.error("Passwords must match.", TOAST_PROPS)
        }
    };

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/home");
    }, [user, loading]);

    return (
        <div>
            <LandingHeader />
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
            
            <div className="register">
                <div>
                <form onSubmit={register} className="register__container">
                    <p><i>Must be a {APPLICATION_VARIABLES.APP_NAME} paid member to register.</i></p>

                    <input
                        type="text"
                        className="register__textBox"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required
                    />
                    <input
                        type="email"
                        className="register__textBox"
                        value={email}
                        onChange={(e) => setEmail((e.target.value).toLowerCase())}
                        placeholder="E-mail Address"
                        required
                    />
                    <input
                        type="password"
                        className="register__textBox"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        className="register__textBox"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter Password"
                        required
                    />
                    <input
                        type="tel"
                        className="register__textBox"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value.replace(/[^+\d]+/g, ""))}
                        placeholder="Phone Number"
                        required
                    />
                    <input
                        type="text"
                        className="register__textBox"
                        value={studentNum}
                        onChange={(e) => setStudentNum(e.target.value)}
                        placeholder="Student Number"
                        required
                    />
                   
                    <select className="register__dropDown" name="grade" id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required>
                        <option value="" disabled defaultValue hidden>Grade</option>
                        <option value="9">9th</option>
                        <option value="10">10th</option>
                        <option value="11">11th</option>
                        <option value="12">12th</option>
                    </select>

                    <hr />

                    <button className="register__btn" type='submit'>
                        Register
                    </button>
                    {/*
                <button
                    className="register__btn register__google"
                    onClick={signInWithGoogle}
                >
                    Register with Google
                </button>
                */}
                    <div>
                        Already have an account? <Link to="/login">Login</Link> now.
                    </div>
                  </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
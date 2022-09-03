import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { auth, logInWithEmailAndPassword, signInWithGoogle } from "../../utils/firebase/firebase.utils";
import { useAuthState } from "react-firebase-hooks/auth";
import LandingHeader from '../../components/LandingHeader/landing-header.component';

import { fetchUsersListStartAsync } from '../../store/users_list/users-list.action';
import { fetchPaidMembersStartAsync } from '../../store/paid_members/paid_members.action';

import { selectPaidMembersList } from '../../store/paid_members/paid_members.selector';
import { selectUsersList, selectUsersListIsLoading } from '../../store/users_list/users-list.selector';

import './login.styles.scss';

import "bootstrap/dist/css/bootstrap.min.css";

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

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, loading, error] = useAuthState(auth);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const paid_members = useSelector(selectPaidMembersList);
    const users = useSelector(selectUsersList);

    useEffect(() => {
        dispatch(fetchUsersListStartAsync());
    }, []);

    useEffect(() => {
        dispatch(fetchPaidMembersStartAsync());
    }, []);

    useEffect(() => {
        if (loading) {
            // maybe trigger a loading screen
            return;
        }
        if (user) navigate("/home");
    }, [user, loading]);

    const handleSignIn = async () => {
        const paidEmails = paid_members.map((member) => member.email);
        const logInAttemptUser = users.filter((user) => user.email === email)[0];

        try {
            if (!email) {
                toast.error('Enter email address!', TOAST_PROPS);
            }
            if (!password) {
                toast.error('Enter password!', TOAST_PROPS);
            }
            if (email&&password) {
                if (paidEmails.indexOf(email) > -1 || logInAttemptUser.role === 'adviser') {
                    await logInWithEmailAndPassword(email, password).then(() => {toast.success('Logged in!', TOAST_PROPS)});
                } else {toast.error('Not a paid member. Please see an adviser.', TOAST_PROPS)}
            }
        } catch (error) {
            switch(error.code) {
                case "auth/wrong-password":
                    toast.error('Incorrect password.', TOAST_PROPS);
                    break
                case "auth/too-many-requests":
                    toast.error('Too many requests! Reset password or try again later.', TOAST_PROPS);    
                    break
                case "auth/user-disabled":
                    toast.error('User is disabled.', TOAST_PROPS);
                    break
                case "auth/user-not-found":
                    toast.error('User not found.', TOAST_PROPS);
                    break
                case "auth/network-request-failed":
                    toast.error('Check internet connection and try again later.', TOAST_PROPS);
                    break
                default:
                    toast.error('Could not log in.', TOAST_PROPS)
                    break;
            }
        }
    };

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

                <div className="login">
                    <div className="login__container">
                    
                        <label style={{textAlign: "left", fontWeight: 'bold'}}>E-mail Address</label>
                        <input
                            type="text"
                            className="login__textBox"
                            value={email}
                            onChange={(e) => setEmail((e.target.value).toLowerCase())}
                            placeholder="E-mail Address"
                            required
                        />
                        <label style={{textAlign: "left", fontWeight: 'bold'}}>Password</label>
                        <input
                            type="password"
                            className="login__textBox"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button
                            className="login__btn"
                            onClick={handleSignIn}
                        >
                            Login
                        </button>

                        {/* GOOGLE SIGN IN
                <button className="login__btn login__google" onClick={signInWithGoogle}>
                    Login with Google
                </button>
                */}
                   
                        <div>
                            <Link to="/reset-password">Forgot Password</Link>
                        </div>
                        <div>
                            Don't have an account? <Link to="/register">Register</Link> now.
                        </div>
                    </div>
                </div>
            </div>

    );
};

export default Login;
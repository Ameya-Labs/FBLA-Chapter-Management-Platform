import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth, sendPasswordReset } from "../../utils/firebase/firebase.utils";
import LandingHeader from '../../components/LandingHeader/landing-header.component';

import "./reset-password.styles.scss";

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

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/home");
    }, [user, loading]);

    const handleSendPasswordReset = () => {
        try {
            sendPasswordReset(email).then(() => {toast.success("Sent reset email successfully!", TOAST_PROPS)})
        } catch (error) {
            toast.error("Could not send reset email!", TOAST_PROPS);
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

            <div className="reset">
                <div className="reset__container">
                    <p><i>Please check spam/junk folders for password reset email.</i></p>
                    <hr />
                    <input
                        type="text"
                        className="reset__textBox"
                        value={email}
                        onChange={(e) => setEmail((e.target.value).toLowerCase())}
                        placeholder="E-mail Address"
                    />
                    <button
                        className="reset__btn"
                        onClick={handleSendPasswordReset}
                    >
                        Send Password Reset Email
                    </button>
                    <div>
                        Don't have an account? <Link to="/register">Register</Link> now.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
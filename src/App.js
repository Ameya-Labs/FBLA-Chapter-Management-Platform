import { React, useEffect, lazy, Suspense } from 'react';
import {
    BrowserRouter,
    Routes,
    Route, Switch,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { onAuthStateChangedListener, getUserMetadata } from './utils/firebase/firebase.utils';
import { setCurrentUser } from './store/user/user.action';
import { fetchDBStoreStartAsync } from './store/db_store/db_store.action';
import { fetchUsersListStartAsync } from './store/users_list/users-list.action';
import { fetchSignupsStartAsync } from './store/signups/signups.action';
import { fetchPaidMembersStartAsync } from './store/paid_members/paid_members.action';
import { fetchEventsStartAsync } from './store/events/events.action';
import { fetchMeetingsStartAsync } from './store/meetings/meetings.action';

import Spinner from './components/Spinner/spinner.component';

import './App.css';

// import Home from './routes/Home/home.component'
// import LandingPage from './routes/LandingPage/landing-page.component'
// import Login from './routes/Login/login.component'
// import Register from './routes/Register/register.component'
// import ResetPassword from './routes/ResetPassword/reset-password.component'
// import EventsList from './routes/EventsList/events-list.component'
// import Profile from './routes/Profile/profile.component'
// import UserList from './routes/UserList/user-list.component'
// import SignupsList from './routes/SignupsList/signups-list.component'
// import Help from './routes/Help/help.component'
// import Footer from './components/Footer/footer.component'

const Home = lazy(() => import('./routes/Home/home.component'));
const LandingPage = lazy(() => import('./routes/LandingPage/landing-page.component'));
const Login = lazy(() => import('./routes/Login/login.component'));
const Register = lazy(() => import('./routes/Register/register.component'));
const ResetPassword = lazy(() => import('./routes/ResetPassword/reset-password.component'));
const EventsList = lazy(() => import('./routes/EventsList/events-list.component'));
const Profile = lazy(() => import('./routes/Profile/profile.component'));
const UserList = lazy(() => import('./routes/UserList/user-list.component'));
const SignupsList = lazy(() => import('./routes/SignupsList/signups-list.component'));
const PaidMemberList = lazy(() => import('./routes/PaidMembersList/paid-members-list.component'));
const Help = lazy(() => import('./routes/Help/help.component'));
const Maintenance = lazy(() => import('./routes/Maintenance/maintenance.component'));
const Meetings = lazy(() => import('./routes/Meetings/meetings.component'));

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChangedListener((user) => {
            const handleFirebasePull = async (user) => {
                const data = await getUserMetadata(user);
            
                const userFields = {
                    user: user,
                    role: data.role,
                    name: data.name,
                    grade: data.grade,
                    email: data.email,
                    phoneNo: data.phoneNo,
                    studentNum: data.studentNum,
                    uid: data.uid,
                }
               
                dispatch(setCurrentUser(userFields));
            };
            handleFirebasePull(user);
        });

        return unsubscribe
    }, []);

    useEffect(() => {
        dispatch(fetchDBStoreStartAsync());
    }, []);

    return (
    <div className='Root'>
        <div className='App'>
            <BrowserRouter>
            <Suspense fallback={<Spinner />}>
                <Routes>

                    <Route path="/" element ={ <LandingPage /> } />
                    <Route exact path="/home" element ={ <Home /> } />
                    <Route exact path="/login" element ={ <Login /> } />
                    <Route exact path="/register" element={ <Register /> } />
                    <Route exact path="/reset-password" element={ <ResetPassword /> } />
                    <Route exact path="/events-list" element={ <EventsList /> } />
                    <Route exact path="/profile" element={ <Profile /> } />
                    <Route exact path="/user-list" element={ <UserList /> } />
                    <Route exact path="/signups" element={ <SignupsList /> } />
                    <Route exact path="/paid-members-list" element={ <PaidMemberList /> } />
                    <Route exact path="/help" element={ <Help /> } />
                    <Route exact path="/maintenance" element={ <Maintenance /> } />
                    <Route exact path="/meetings" element={ <Meetings /> } />

                </Routes>
            </Suspense>
            </BrowserRouter>
        </div>
    </div>
    );

};

export default App;

import React from 'react'
import { Card, Button } from "react-bootstrap";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "../../utils/firebase/firebase.utils";

import Header from '../../components/Header/header.component';
import LandingHeader from '../../components/LandingHeader/landing-header.component';
import SocialIconsGroup from '../../components/SocialIconsGroup/social-icons-group.component';

import './landing-page.styles.scss';

import APPLICATION_VARIABLES from '../../settings';

const LandingPage = () => {
    const [user, loading, error] = useAuthState(auth);

    return (
        <div >
            {!user && (<LandingHeader />)}
            {user && (<Header />)}

            <Card className="m-5 mt-4 border-0">
                <Card.Body>
                    <br />
                    <img src={require('../../assets/landing-page-img.jpg')} alt='Chapter Pic' style={{
                            width: '50%',
                            borderRadius: '15px',
                            }}
                    />
                    <Card.Title className="mt-4 mb-4" style={{fontSize: '28px', fontWeight: 'bold'}}>Welcome to {APPLICATION_VARIABLES.APP_NAME}!</Card.Title>
                    <Card.Subtitle className="mb-2 mx-auto fw-lighter lh-base text-break" style={{
                            width: '60%',
                            fontSize: '19px',
                            }}>{APPLICATION_VARIABLES.LANDING_PAGE_DESCRIPTION}</Card.Subtitle>
                    <Button as="a" href={`${APPLICATION_VARIABLES.CHAPTER_WEBSITE}`} target="_blank" className="mt-3" variant="outline-dark">Visit our Chapter Website</Button>
                </Card.Body>
            </Card>

            <SocialIconsGroup />
        </div>
    );
};

export default LandingPage;
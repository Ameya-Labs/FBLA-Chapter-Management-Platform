import React from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";

import 'bootstrap/dist/css/bootstrap.min.css';

import APPLICATION_VARIABLES from '../../settings';

import './landing-header-styles.scss';

const LandingHeader = () => {
    return (
        <Navbar collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: APPLICATION_VARIABLES.NAV_BAR_COLOR}}>
            <Container>
                <Navbar.Brand href="/" style={{fontSize: "28px", fontWeight:"bold"}} ><img alt="" src={require('../../assets/chapter-icon.png')} width='40' height='40' className="d-inline-block align-top" />{' '}{APPLICATION_VARIABLES.APP_NAME}</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link className="navItem" href="/">Home</Nav.Link>
                        <Nav.Link className="navItem" as="a" href={`${APPLICATION_VARIABLES.CHAPTER_WEBSITE}`} target="_blank">Chapter Website</Nav.Link>
                        <Nav.Link className="navItem" href="/help">Help</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link className="navItem" href="/login">Login</Nav.Link>
                        <Nav.Link className="navItem" disabled={true}>|</Nav.Link>
                        <Nav.Link className="navItem" href="/register">Register</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default LandingHeader;
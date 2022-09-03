import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";

import { logout, auth } from "../../utils/firebase/firebase.utils";

import { selectCurrentUser } from '../../store/user/user.selector';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Navbar, Nav, Container, NavDropdown}  from "react-bootstrap";

import APPLICATION_VARIABLES from '../../settings';

import './header.styles.scss';

const Header = () => {
    const [user, loading, error] = useAuthState(auth);
    const [showSignupsListForMembers, setShowSignupsListForMembers] = useState(false);
    
    const navigate = useNavigate();

    const { name, role } = useSelector(selectCurrentUser);

    useEffect(() => {
        if (loading) return;
        if (!user) return navigate("/");
    }, [user, loading]);

    if (role === "adviser") {
        return (
            <Navbar collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: APPLICATION_VARIABLES.NAV_BAR_COLOR}}>
                <Container>
                    <Navbar.Brand href="/home" style={{fontSize: "28px", fontWeight:"bold"}} ><img alt="" src={require('../../assets/chapter-icon.png')} width='40' height='40' className="d-inline-block align-top" />{' '}{APPLICATION_VARIABLES.APP_NAME}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link className="navItem" href="/home">Home</Nav.Link>
                            <NavDropdown className="navDropdown" title="Adviser Access" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="/meetings">Meetings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/signups">Signups List</NavDropdown.Item>
                                <NavDropdown.Item href="/events-list">Events List</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/user-list">User List</NavDropdown.Item>
                                <NavDropdown.Item href="/paid-members-list">Paid Members List</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/maintenance">Maintenance</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link className="navItem" as="a" href={`${APPLICATION_VARIABLES.CHAPTER_WEBSITE}`} target="_blank">Chapter Website</Nav.Link>
                            <Nav.Link className="navItem" href="/help">Help</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link className="navItem" href="/profile">{name}</Nav.Link>
                            <Nav.Link className="navItem" disabled={true}>|</Nav.Link>
                            <Nav.Link className="navItem" onClick={ logout }>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
    else if (role === "officer") {
        return (
            <Navbar collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: APPLICATION_VARIABLES.NAV_BAR_COLOR}}>
                <Container>
                    <Navbar.Brand href="/home" style={{fontSize: "28px", fontWeight:"bold"}} ><img alt="" src={require('../../assets/chapter-icon.png')} width='40' height='40' className="d-inline-block align-top" />{' '}{APPLICATION_VARIABLES.APP_NAME}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link className="navItem" href="/home">Home</Nav.Link>
                            <NavDropdown className="navItem" title="Officer Access" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="/meetings">Meetings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/signups">Signups List</NavDropdown.Item>
                                <NavDropdown.Item href="/events-list">Events List</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/user-list">User List</NavDropdown.Item>
                                <NavDropdown.Item href="/paid-members-list">Paid Members List</NavDropdown.Item>                                
                            </NavDropdown>
                            <Nav.Link className="navItem" as="a" href={`${APPLICATION_VARIABLES.CHAPTER_WEBSITE}`} target="_blank">Chapter Website</Nav.Link>
                            <Nav.Link className="navItem" href="/help">Help</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link className="navItem" href="/profile">{name}</Nav.Link>
                            <Nav.Link className="navItem" disabled={true}>|</Nav.Link>
                            <Nav.Link className="navItem" onClick={ logout }>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
    else {
        return (
            <Navbar collapseOnSelect expand="lg" variant="dark" style={{backgroundColor: APPLICATION_VARIABLES.NAV_BAR_COLOR}}>
                <Container>
                    <Navbar.Brand href="/home" style={{fontSize: "28px", fontWeight:"bold"}} ><img alt="" src={require('../../assets/chapter-icon.png')} width='40' height='40' className="d-inline-block align-top" />{' '}{APPLICATION_VARIABLES.APP_NAME}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link className="navItem" href="/home">Home</Nav.Link>
                            <NavDropdown className="navItem" title="Member Access" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="/meetings">Meetings</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/events-list">Events List</NavDropdown.Item>

                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/signups">Signups List</NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link className="navItem" as="a" href={`${APPLICATION_VARIABLES.CHAPTER_WEBSITE}`} target="_blank">Chapter Website</Nav.Link>
                            <Nav.Link className="navItem" href="/help">Help</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link className="navItem" href="/profile">{name}</Nav.Link>
                            <Nav.Link className="navItem" disabled={true}>|</Nav.Link>
                            <Nav.Link className="navItem" onClick={ logout }>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

};

export default Header;

import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';

import {Card, CardGroup, FloatingLabel, Form, Button, Badge, Modal, ButtonGroup, Table} from "react-bootstrap";

import { addQuickLinkToDB, deleteQuickLinkFromDB, db } from "../../utils/firebase/firebase.utils";
import { onSnapshot, doc } from "firebase/firestore";

import { selectCurrentUser } from '../../store/user/user.selector';

import Spinner from '../../components/Spinner/spinner.component';
import TotalCountCard from '../../components/TotalCardCount/total-card-count.component';

import RandomCodeGenerator from '../../functions/random-code-generator.function';

import APPLICATION_VARIABLES from '../../settings';
import EXCLUDE_USERS from '../../excludeUsers';

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

const DEFAULT_CURRENT_QUICK_LINK = {
  name: "",
  url: "",
  id: "",
};

const ChapterInfo = ({master_users, master_signups, master_events, master_paid_members}) => {
  const [showQuickLinksManager, setShowQuickLinksManager] = useState(false);
  const [masterQuickLinks, setMasterQuickLinks] = useState([]);
  const [isMasterQuickLinksLoading, setIsMasterQuickLinksLoading] = useState(true);
  const [selectedQuickLink, setSelectedQuickLink] = useState(DEFAULT_CURRENT_QUICK_LINK);
  const [newQuickLink, setNewQuickLink] = useState(DEFAULT_CURRENT_QUICK_LINK);
  const [officersList, setOfficersList] = useState([]);
  const [advisersList, setAdvisersList] = useState([]);
  const [dataForStatBar, setDataForStatBar] = useState({});

  const { role } = useSelector(selectCurrentUser);



  useEffect(() => {
    const count_Data_OBJ = {
        signups_data: master_signups,
        signups_path: "/signups",
        events_data: master_events,
        events_path: "/events-list",
        users_data: master_users,
        users_path: "/user-list",
        paid_members_data: master_paid_members,
        paid_members_path: "/paid-members-list",
    };

    setDataForStatBar(count_Data_OBJ);
  }, [master_signups, master_events, master_users, master_paid_members]);


  useEffect(() => {
    setIsMasterQuickLinksLoading(true);

    const unsubscribe = onSnapshot(doc(db, "db_store", "quick_links"), (doc) => {
        setMasterQuickLinks(doc.data().quick_links);
    });

    return unsubscribe
  }, []);

  useEffect(() => {
      if (masterQuickLinks) {
          setIsMasterQuickLinksLoading(false);
      }
  }, [masterQuickLinks]);


  useEffect(() => {
    const officers = master_users.filter((user) => {
      if (EXCLUDE_USERS.officers.indexOf(user.email) === -1) {
        return user.role === 'officer';
      } else {return false}
    });

    officers.sort((a, b) => a.name.localeCompare(b.name))

    setOfficersList(officers);
  }, [master_users]);

  useEffect(() => {
    const advisers = master_users.filter((user) => {
      if (EXCLUDE_USERS.advisers.indexOf(user.email) === -1) {
        return user.role === 'adviser';
      } else {return false}
    });

    advisers.sort((a, b) => a.name.localeCompare(b.name))

    setAdvisersList(advisers);
  }, [master_users]);


  const handleAddNewQuickLink = async () => {
    if (newQuickLink.name && newQuickLink.url) {

      var new_URL = newQuickLink.url;

      if (new_URL.substring(0,4) === 'http') {
          new_URL = `https://${new_URL.split('://')[1]}`;
      } else if (new_URL === '' || new_URL === ' ') {
          new_URL = "";
      } else {
          new_URL = `https://${new_URL}`;
      }

      const quickLinkDoc = {
        name: newQuickLink.name,
        url: new_URL,
        id: RandomCodeGenerator(20),
      }

      await addQuickLinkToDB(quickLinkDoc).then(async () => {
        toast.success('Saved link!', TOAST_PROPS);
        setNewQuickLink(DEFAULT_CURRENT_QUICK_LINK);
      }).catch((error) => {
        toast.error('Could not save link!', TOAST_PROPS);
      });

    } else {
      toast.error('Fill out all fields', TOAST_PROPS);
    }
  };

  const handleQuickLinkDelete = async () => {
    await deleteQuickLinkFromDB(selectedQuickLink.id).then(() => {
      toast.success('Deleted link', TOAST_PROPS);
    }).catch((error) => {
      toast.error('Could not delete link!', TOAST_PROPS);
    });;
  };

  const handleModalClose = () => {
    setShowQuickLinksManager(false);
  };


  return (
    <>

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

      <Modal show={showQuickLinksManager} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Edit Quick Links</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Table responsive striped bordered>
                <thead>
                    <tr style={{background: APPLICATION_VARIABLES.TABLE_HEADER_COLOR}}>
                        <th>#</th>
                        <th>Name</th>
                        <th>URL</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {role !== 'member' && (<tr style={{ backgroundColor: APPLICATION_VARIABLES.NEW_MEETING_ROW_COLOR, color: APPLICATION_VARIABLES.NEW_MEETING_ROW_TEXT_COLOR }}>
                        <td style={{fontWeight:'bold'}}>{"New"}</td>
                        <td>
                            <Form.Control
                            required
                            type="text"
                            size="sm"
                            placeholder="Name"
                            value={newQuickLink.name}
                            onChange={(e) => {
                              setNewQuickLink({
                                ...newQuickLink,
                                name: e.target.value,
                              })
                            }}
                            />
                        </td>

                        <td>
                            <Form.Control
                            required
                            type="text"
                            size="sm"
                            placeholder="URL"
                            value={newQuickLink.url}
                            onChange={(e) => {
                              setNewQuickLink({
                                ...newQuickLink,
                                url: e.target.value,
                              })
                            }}
                            />
                        </td>

                        
                        <td><Button 
                            variant="outline-success"
                            onClick={handleAddNewQuickLink}
                            >Add New</Button>
                        </td>
                    </tr>)}
                    {masterQuickLinks &&
                        masterQuickLinks.map((linkItem, index) => (
                            // TODO center text in row
                            <tr key={index} className="">
                                <td>{index + 1}</td>
                                <td>{linkItem.name}</td>
                                <td>{linkItem.url}</td>
                            
                                <td className="space-x-2">
                                    {role !== 'member' && (<>

                                    <Button
                                        variant="outline-danger"
                                        disabled={false}
                                        onClick={() => {
                                          setSelectedQuickLink({
                                            ...selectedQuickLink,
                                            name: linkItem.name,
                                            url: linkItem.url,
                                            id: linkItem.id,
                                          })

                                          handleQuickLinkDelete();
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
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>Close</Button>
        </Modal.Footer>
      </Modal>



            {true && (
                    <Card className="m-5 mt-4 mb-7 mx-auto" style={{ maxWidth: '60rem', backgroundColor: APPLICATION_VARIABLES.CARD_BACKGROUND_COLOR }}>
                        <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Chapter Info</Card.Header>
                        <Card.Body>
                            {dataForStatBar.events_data && dataForStatBar.signups_data && dataForStatBar.users_data && dataForStatBar.paid_members_data && role && <TotalCountCard data_OBJ={dataForStatBar} role={role} />}

                            <CardGroup style={{ align: 'center', display: "flex", flexDirection: "row", justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>

                                <Card className="m-5 mt-4 mb-2 mx-auto" style={{ maxWidth: '60rem' }}>
                                    <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Quick Links</Card.Header>
                                    <Card.Body>
                                            {role !== 'member' && (
                                                <>
                                                    <Button variant="outline-dark" style={{align: 'right', float: 'right', width: '100%', }} onClick={() => {setShowQuickLinksManager(true)}} >&#9881; Manage</Button>
                                                    <br />
                                                </>
                                            )}

                                            { isMasterQuickLinksLoading ? <Spinner /> : (<>
                                                
                                                {(masterQuickLinks) ? (masterQuickLinks.map((link, index) => (
                                                    <Card.Subtitle className="mt-4" key={index} ><a href={`${link.url}`} target="_blank"> {link.name} </a></Card.Subtitle>
                                                ))) : (
                                                    <p>No links avaliable at this time.</p>
                                                )
                                                }

                                            </>)}
                                    </Card.Body>
                                </Card>


                                <Card className="m-5 mt-4 mb-2 mx-auto" style={{ maxWidth: '60rem' }}>
                                    <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Chapter Leadership</Card.Header>
                                    <Card.Body>
                                        
                                        <Card.Subtitle className="mb-2" style={{textAlign: 'left'}}><strong>Officers:</strong></Card.Subtitle>

                                            { !officersList ? <Spinner /> : (<>
                                                
                                                {(officersList) ? (officersList.map((officer, index) => (
                                                    <Card.Subtitle className="mt-3" key={index} >{officer.name}</Card.Subtitle>
                                                ))) : (
                                                    <p>No officers</p>
                                                )
                                                }

                                            </>)}

                                        <br />

                                        <Card.Subtitle className="mb-2" style={{textAlign: 'left'}}><strong>Advisers:</strong></Card.Subtitle>
                                            { !advisersList ? <Spinner /> : (<>
                                                
                                                {(advisersList) ? (advisersList.map((adviser, index) => (
                                                    <Card.Subtitle className="mt-3" key={index} ><a href={`mailto:${adviser.email}`}>{adviser.name}</a></Card.Subtitle>
                                                ))) : (
                                                    <p>No advisers</p>
                                                )
                                                }

                                            </>)}

                                    </Card.Body>
                                </Card>


                            </CardGroup>                            
                        </Card.Body>
                    </Card>
                )}
    </>
  )
}

export default ChapterInfo;
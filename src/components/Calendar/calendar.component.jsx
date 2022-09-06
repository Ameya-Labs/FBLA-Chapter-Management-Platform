import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import { fetchMeetingsStartAsync } from '../../store/meetings/meetings.action';
import { selectMeetingsList, selectMeetingsListIsLoading } from '../../store/meetings/meetings.selector';
import { selectCalendarEvents, selectDBStoreIsLoading } from '../../store/db_store/db_store.selector';

import { addEventToDBCalendar, deleteEventFromDBCalendar } from '../../utils/firebase/firebase.utils';

import { calendarInviteEmail } from '../../utils/emails/emails.utils';

import RandomCodeGenerator from '../../functions/random-code-generator.function';

import { createEvent } from 'ics';

import {
  Button,
  Modal,
  Form,
  FloatingLabel,
} from "react-bootstrap";

import './calendar.styles.scss';

import Spinner from '../Spinner/spinner.component';

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

const DEFAULT_CALENDAR_EVENT = {
  title: '',
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  id: "",
  flag: "",
}


const Calendar = ({role}) => {
  const [toggleWeekends, setToggleWeekends] = useState(true);
  const [eventsData, setEventsData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addDeleteFormType, setAddDeleteFormType] = useState('Add');
  const [currentCalendarEvent, setCurrentCalendarEvent] = useState(DEFAULT_CALENDAR_EVENT);
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();

  const master_meetings = useSelector(selectMeetingsList);
  const isMeetingsListLoading = useSelector(selectMeetingsListIsLoading);

  const master_calendar_events = useSelector(selectCalendarEvents);
  const isDBStoreLoading = useSelector(selectDBStoreIsLoading);

  useEffect(() => {
    dispatch(fetchMeetingsStartAsync());
  }, []);
  
  useEffect(() => {
    async function fetchCalendarEvents() {

      var calendar_events = [...eventsData];
      var event_ids = [];

      for (const event of eventsData) {
        event_ids.push(event.id);
      }

      for (const meeting of master_meetings) {
        const meeting_doc = {
          id: meeting.id,
          title: meeting.name,
          start: `${meeting.date}T${meeting.start_time}`,
          end: `${meeting.date}T${meeting.start_time}`,
          flag: meeting.flag,
          color: APPLICATION_VARIABLES.CALENDAR_MEETING_COLOR,
        }

        if (event_ids.indexOf(meeting_doc.id) === -1) {
          calendar_events.push(meeting_doc);
          event_ids.push(meeting_doc.id);
        }
      }

      for (const event of master_calendar_events) {       
        const event_doc = {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          flag: event.flag,
        }

        if (event_ids.indexOf(event_doc.id) === -1) {
          calendar_events.push(event_doc);
          event_ids.push(event_doc.id);
        }
      }

      setEventsData(calendar_events)
    }

    fetchCalendarEvents();
  }, [master_meetings, master_calendar_events]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (role !== 'member') {
      if (addDeleteFormType === 'Add') {
        if (currentCalendarEvent.title && currentCalendarEvent.start_date && currentCalendarEvent.start_time && currentCalendarEvent.end_date && currentCalendarEvent.end_time) {

          const eventDoc = {
            title: currentCalendarEvent.title,
            start: `${currentCalendarEvent.start_date}T${currentCalendarEvent.start_time}`,
            end: `${currentCalendarEvent.end_date}T${currentCalendarEvent.end_time}`,
            id: RandomCodeGenerator(20),
            flag: 'event',
          }
    
          var calendar_events = [...eventsData];
          calendar_events.push(eventDoc);
          setEventsData(calendar_events);
    
          await addEventToDBCalendar(eventDoc).then(async () => {
            // await handleCalendarInviteEmailSend(currentCalendarEvent);
            toast.success('Saved event!', TOAST_PROPS);
            handleModalClose();
          }).catch((error) => {
            toast.error('Could not save event!', TOAST_PROPS);
            handleModalClose();
          });
          } else {
            toast.error('Fill out all fields', TOAST_PROPS);
          }

        } else if (addDeleteFormType === 'Delete') {

          if (role !== 'member') {
            if (currentCalendarEvent.flag === 'meeting') {
              toast.info('Meetings can be deleted from the meetings page.', TOAST_PROPS);
            } else {
                            

              var calendar_events = [];
              for (const event of eventsData) {
                if (event.id !== currentCalendarEvent.id) {
                  calendar_events.push(event);
                }
              }
              setEventsData(calendar_events);
    
              await deleteEventFromDBCalendar(currentCalendarEvent.id).then(() => {
                toast.success('Deleted event', TOAST_PROPS);
                handleModalClose();
              }).catch((error) => {
                toast.error('Could not delete event!', TOAST_PROPS);
                handleModalClose();
              });;
              
            }
          }

        }
    }
  }

  const handleModalClose = () => {
    setCurrentCalendarEvent(DEFAULT_CALENDAR_EVENT);
    setShowAddForm(false);
    setAddDeleteFormType('Add');
  };

  // const handleCalendarInviteEmailSend = (eventDoc) => {
 
  //   const dateParts = eventDoc.start_date.split('-');
  //   const timeParts = eventDoc.start_time.split(':');

  //   const startSTR = `${currentCalendarEvent.start_date}T${currentCalendarEvent.start_time}`;
  //   const endSTR = `${currentCalendarEvent.end_date}T${currentCalendarEvent.end_time}`;
  //   var start_date = new Date(startSTR);
  //   var end_date = new Date(endSTR);

  //   var seconds_duration = parseInt((end_date.getTime() / 1000) - (start_date.getTime() / 1000));

  //   const event = {
  //     start: [parseInt(dateParts[0]), parseInt(dateParts[1]), parseInt(dateParts[2]), parseInt(timeParts[0]), parseInt(timeParts[1])],
  //     duration: { seconds: seconds_duration },
  //     title: `${APPLICATION_VARIABLES.TITLE}`,
  //     description: `${APPLICATION_VARIABLES.APP_NAME} ${eventDoc.title}`,
  //     url: `${APPLICATION_VARIABLES.APP_LINK}`,
  //     status: 'CONFIRMED',
  //     busyStatus: 'BUSY',
  //     organizer: { name: `${APPLICATION_VARIABLES.APP_NAME}`, email: `${APPLICATION_VARIABLES.GENERAL_EMAIL}` },
  //     attendees: []
  //   }
  //   createEvent(event, async (error, value) => {
  //     if (error) {
  //       console.log(error)
  //       return
  //     }

  //     const emailDoc = {
  //       toEmails: ['jadhavameyak@gmail.com'],
  //       icsAttachment: value,
  //     }
    
  //     await calendarInviteEmail(emailDoc);
  //   })
  // }
  
    return (
      <div>
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
        
        <Modal show={showAddForm} onHide={handleModalClose}>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleOnSubmit}
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {addDeleteFormType === "Add" ? "Add Calendar Event" : "View Calendar Event"}
                </Modal.Title>
              </Modal.Header>
                <Modal.Body>


                  <FloatingLabel
                    controlId="eventName"
                    label="Event Name"
                    className="mb-3"
                  >
                    <Form.Control
                      required
                      disabled={addDeleteFormType === "Delete"}
                      type="text"
                      placeholder="Event Name"
                      size="md"
                      value={currentCalendarEvent.title}
                      onChange={(e) => {
                        setCurrentCalendarEvent({
                          ...currentCalendarEvent,
                          title: e.target.value,
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Event name is required
                    </Form.Control.Feedback>
                  </FloatingLabel>

                  <FloatingLabel
                    controlId="startDate"
                    label="Start Date"
                    className="mb-3"
                  >
                    <Form.Control
                      required
                      disabled={addDeleteFormType === "Delete"}
                      type="date"
                      placeholder="Start Date"
                      size="md"
                      value={currentCalendarEvent.start_date}
                      onChange={(e) => {
                        setCurrentCalendarEvent({
                          ...currentCalendarEvent,
                          start_date: e.target.value,
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Start date is required
                    </Form.Control.Feedback>
                  </FloatingLabel>


                  <FloatingLabel
                    controlId="startTime"
                    label="Start Time"
                    className="mb-3"
                  >
                    <Form.Control
                      required
                      disabled={addDeleteFormType === "Delete"}
                      type="time"
                      placeholder="Start Time"
                      size="md"
                      value={currentCalendarEvent.start_time}
                      onChange={(e) => {
                        setCurrentCalendarEvent({
                          ...currentCalendarEvent,
                          start_time: e.target.value,
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Start time is required
                    </Form.Control.Feedback>
                  </FloatingLabel>



                  <FloatingLabel
                    controlId="endDate"
                    label="End Date"
                    className="mb-3"
                  >
                    <Form.Control
                      required
                      disabled={addDeleteFormType === "Delete"}
                      type="date"
                      placeholder="End Date"
                      size="md"
                      value={currentCalendarEvent.end_date}
                      onChange={(e) => {
                        setCurrentCalendarEvent({
                          ...currentCalendarEvent,
                          end_date: e.target.value,
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      End date is required
                    </Form.Control.Feedback>
                  </FloatingLabel>


                  <FloatingLabel
                    controlId="endTime"
                    label="End Time"
                    className="mb-3"
                  >
                    <Form.Control
                      required
                      disabled={addDeleteFormType === "Delete"}
                      type="time"
                      placeholder="End Time"
                      size="md"
                      value={currentCalendarEvent.end_time}
                      onChange={(e) => {
                        setCurrentCalendarEvent({
                          ...currentCalendarEvent,
                          end_time: e.target.value,
                        });
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      End time is required
                    </Form.Control.Feedback>
                  </FloatingLabel>
            
                </Modal.Body>
                <Modal.Footer>
                  {addDeleteFormType === 'Add' && (<Button type="submit">
                    Add Event
                  </Button>)}

                  {role !== 'member' && currentCalendarEvent.flag !== 'meeting' && addDeleteFormType === 'Delete' && (<Button type="submit">
                    Delete Event
                  </Button>)}
                  
                </Modal.Footer>
            </Form>
          </Modal>


      {
        isMeetingsListLoading || isDBStoreLoading ? <Spinner /> :

      (

          <div className='calendar-view'>
          <div className='calendar-configs'>
            <label>
              <input
                type='checkbox'
                checked={toggleWeekends}
                onChange={() => {setToggleWeekends(!toggleWeekends)}}
              ></input>
              Toggle Weekends
            </label>
          </div>
          <div className='calendar-app'>
        
            <FullCalendar
              plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
              headerToolbar={{
                left: 'prev today next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              displayEventEnd="true"
              events={eventsData}
              eventColor={APPLICATION_VARIABLES.CALENDAR_EVENT_COLOR}
              themeSystem="simple"
              //slotMinTime="07:00:00"
              allDaySlot={false}
              //contentHeight="auto"
              slotEventOverlap={true}
              nowIndicator={true}
              scrollTime='07:00:00'
              longPressDelay='20'
          
              selectable={role !== 'member'}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={toggleWeekends}
              eventClick={async (e) => {
                const fetched_event = await eventsData.find(event => event.id === e.event.id);

                setCurrentCalendarEvent({
                  title: e.event.title,
                  start_date: fetched_event.start.split('T')[0],
                  start_time: fetched_event.start.split('T')[1].slice(0,5),
                  end_date: fetched_event.end.split('T')[0],
                  end_time: fetched_event.end.split('T')[1].slice(0,5),
                  id: e.event.id,
                  flag: fetched_event.flag,
                });

                setAddDeleteFormType('Delete');
                setShowAddForm(true);
              }}
              select={(e) => {
                if (e.view.type === 'timeGridWeek') {
                  setCurrentCalendarEvent({
                    ...currentCalendarEvent,
                    start_date: e.startStr.split('T')[0],
                    start_time: e.startStr.split('T')[1].slice(0,5),
                    end_date: e.endStr.split('T')[0],
                    end_time: e.endStr.split('T')[1].slice(0,5),
                  });

                } else if (e.view.type === 'dayGridMonth') {
                  setCurrentCalendarEvent({
                    ...currentCalendarEvent,
                    start_date: e.startStr,
                    end_date: e.startStr,
                  });
                } else if (e.view.type === 'timeGridDay') {
                  setCurrentCalendarEvent({
                    ...currentCalendarEvent,
                    start_date: e.startStr.split('T')[0],
                    start_time: e.startStr.split('T')[1].slice(0,5),
                    end_date: e.endStr.split('T')[0],
                    end_time: e.endStr.split('T')[1].slice(0,5),
                  });
                }

                if(role !== 'member') {
                  setAddDeleteFormType('Add');
                  setShowAddForm(true);
                }
              }}
            />
          </div>
        </div>
        )}
      </div>
    )
}

export default Calendar;
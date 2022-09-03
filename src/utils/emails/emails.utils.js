import {
  doc,
  setDoc,
  collection
} from "firebase/firestore";

import { db } from '../firebase/firebase.utils';

import APPLICATION_VARIABLES from '../../settings';

export const submittedNewEventEmail = async ({toEmails, adderName, eventName, added2, added3, added4, added5}) => {
  // const submitEmailDoc = {
  //   toEmails: [''],
  //   adderName: '', 
  //   eventName: '', 
  //   added2: '', 
  //   added3: '', 
  //   added4: '', 
  //   added5: '',
  // };

  const chapterName = APPLICATION_VARIABLES.APP_NAME;
  const appLink = APPLICATION_VARIABLES.APP_LINK;

  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //Months are zero based
  var curr_year = d.getFullYear();
  var date = curr_month + "/" + curr_date + "/" + curr_year;

  await setDoc(doc(collection(db, "mail")), {
    to: toEmails,
    template: {
      name: 'submittedNewEvent_emailTemplate',
      data: {
        chapterName,
        adderName,
        eventName,
        date,
        added2,
        added3,
        added4,
        added5,
        appLink,
      }
    }
  });
};

export const editedEventEmail = async ({toEmails, eventName, editorName, oldMember2, oldMember3, oldMember4, oldMember5, newMember2, newMember3, newMember4, newMember5}) => {
  // const editEmailDoc = {
  //   toEmails: [''],
  //   eventName: '', 
  //   editorName: '', 
  //   oldMember2: '', 
  //   oldMember3: '', 
  //   oldMember4: '', 
  //   oldMember5: '', 
  //   newMember2: '', 
  //   newMember3: '', 
  //   newMember4: '', 
  //   newMember5: '', 
  // };
  
  const chapterName = APPLICATION_VARIABLES.APP_NAME;
  const appLink = APPLICATION_VARIABLES.APP_LINK;

  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //Months are zero based
  var curr_year = d.getFullYear();
  var date = curr_month + "/" + curr_date + "/" + curr_year;

  await setDoc(doc(collection(db, "mail")), {
    to: toEmails,
    template: {
      name: 'editedEvent_emailTemplate',
      data: {
        chapterName,
        editorName,
        eventName,
        date,
        oldMember2,
        oldMember3,
        oldMember4,
        oldMember5,
        newMember2,
        newMember3,
        newMember4,
        newMember5,
        appLink,
      }
    }
  });
};

export const deletedEventEmail = async ({toEmails, eventName, deletorName, oldMember2, oldMember3, oldMember4, oldMember5, newMember2, newMember3, newMember4, newMember5}) => {
  // const deleteEmailDoc = {
  //   toEmails: [''],
  //   eventName: '', 
  //   deletorName: '', 
  //   oldMember2: '', 
  //   oldMember3: '', 
  //   oldMember4: '', 
  //   oldMember5: '', 
  //   newMember2: '', 
  //   newMember3: '', 
  //   newMember4: '', 
  //   newMember5: '', 
  // };
  
  const chapterName = APPLICATION_VARIABLES.APP_NAME;
  const appLink = APPLICATION_VARIABLES.APP_LINK;

  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //Months are zero based
  var curr_year = d.getFullYear();
  var date = curr_month + "/" + curr_date + "/" + curr_year;

  await setDoc(doc(collection(db, "mail")), {
    to: toEmails,
    template: {
      name: 'deletedEvent_emailTemplate',
      data: {
        chapterName,
        deletorName,
        eventName,
        date,
        oldMember2,
        oldMember3,
        oldMember4,
        oldMember5,
        newMember2,
        newMember3,
        newMember4,
        newMember5,
        appLink,
      }
    }
  });
};


// export const calendarInviteEmail = async ({toEmails, icsAttachment}) => {  
//   const chapterName = APPLICATION_VARIABLES.APP_NAME;
//   const appLink = APPLICATION_VARIABLES.APP_LINK;

//   await setDoc(doc(collection(db, "mail")), {
//     to: toEmails,
//     template: {
//       name: 'sendICSCalendarEvent_emailTemplate',
//       data: {
//         chapterName,
//         appLink,
//         generatedICSEvent: "icsAttachment"
//       },
//     }
//   });
// };
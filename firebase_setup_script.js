// import { initializeApp } from "firebase/app";

// import {
//     getFirestore,
//     doc,
//     setDoc,
// } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_API_KEY,
//     authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//     projectId: process.env.REACT_APP_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//     appId: process.env.REACT_APP_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// const createDBStore = async () => {
//   await setDoc(doc(db, "db_store", "db_store"), {
//       calendar_events: [],
//       eventResourcesURL: "",
//       otherCompetitorsVisible: false,
//       signupConf: "",
//       signupDate: "",
//       signupToggle: false,
//   })
// };

// const createDeletedEmailTemplates = async () => {
//   await setDoc(doc(db, "email_templates", "deletedEvent_emailTemplate"), {
//     html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{deletorName}}</strong> has left your team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team was...</p> <p>1. {{deletorName}}</p> <p>2. {{oldMember2}}</p> <p>3. {{oldMember3}}</p> <p>4. {{oldMember4}}</p> <p>5. {{oldMember5}}</p> <br /> <p>The team now is...</p> <p>1. {{newMember2}}</p> <p>2. {{newMember3}}</p> <p>3. {{newMember4}}</p> <p>4. {{newMember5}}</p> <p>5. </p> <br /> <p>If you believe this was by mistake, please contact <strong>{{deletorName}}</strong> or the <strong>{{chapterName}}</strong> team.</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
//     subject: "{{deletorName}} has left your event team"
//   })
// };

// const createEditedEmailTemplates = async () => {
//   await setDoc(doc(db, "email_templates", "editedEvent_emailTemplate"), {
//     html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{editorName}}</strong> has edited your team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team was...</p> <p>1. {{editorName}}</p> <p>2. {{oldMember2}}</p> <p>3. {{oldMember3}}</p> <p>4. {{oldMember4}}</p> <p>5. {{oldMember5}}</p> <br /> <p>The team now is...</p> <p>1. {{editorName}}</p> <p>2. {{newMember2}}</p> <p>3. {{newMember3}}</p> <p>4. {{newMember4}}</p> <p>5. {{newMember5}}</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
//     subject: "{{editorName}} has EDITED event team"
//   })
// };

// const createCreatedEmailTemplates = async () => {
//   await setDoc(doc(db, "email_templates", "submittedNewEvent_emailTemplate"), {
//     html: "<html> <body> <hr /> <p><i>This is an automated message from the {{chapterName}} web app.</i></p> <hr /> <p>Hello,</p> <p><strong>{{adderName}}</strong> has created a new team for <strong>{{eventName}}</strong> on <strong>{{date}}</strong>.</p> <br /> <p>The team is...</p> <p>1. {{adderName}}</p> <p>2. {{added2}}</p> <p>3. {{added3}}</p> <p>4. {{added4}}</p> <p>5. {{added5}}</p> <br /> <p>Thanks,</p> <p>Your {{chapterName}} team</p> <a href={{appLink}}>{{chapterName}} Web App</a> </body> </html>",
//     subject: "{{adderName}} has CREATED new event team"
//   })
// };


// await createDBStore();
// await createDeletedEmailTemplates();
// await createEditedEmailTemplates();
// await createCreatedEmailTemplates();

import { useState, useEffect } from 'react';

import { downloadCollection } from '../../utils/firebase/firebase.utils';

import CsvDownload from 'react-json-to-csv';

// For downloading Firestore data as JSON: https://stackoverflow.com/questions/71988452/react-button-to-export-data-from-firebase-firestore-database

const DownloadFile = ({data, specialCode, specialType}) => {    
  const [download, setDownload] = useState([])
  const usersSortOrder = {'name': 1, 'role': 2, 'grade': 3, 'email': 4, 'phoneNo': 5, 'studentNum': 6, 'authProvider': 7};
  const eventsSortOrder = {'Name': 1, 'Category': 2, 'Conference': 3, 'Group': 4, 'IntroEvent': 5, 'TeamEvent': 6, 'TeamMemberLimit': 7, 'CompetitorLimit': 8};
  const signupsSortOrder = {'eventName': 1, 'conf': 2, 'member1': 3, 'member2': 4, 'member3': 5, 'member4': 6, 'member5': 7, 'promotedToSLC': 8, 'id': 9};
  const signupsPromotionSortOrder = {'eventName': 1, 'conf': 2, 'member1': 3, 'member2': 4, 'member3': 5, 'member4': 6, 'member5': 7, 'id': 8, 'promotedToSLC': 9};
  const paidMembersSortOrder = {'studentNum': 1, 'name': 2, 'email': 3};
  const meetingsSortOrder = {'name': 1, 'date': 2, 'start_time': 3, 'end_time': 4, 'code': 5, 'url': 6, 'attendeeCount': 7, 'attendees': 8};

  useEffect(() => {
    const awaitFetch = async (collection) => {
      var fetched_data = await downloadCollection(collection);

      fetched_data = fetched_data.map((item) => { 
        if (data==="users") {
          delete item.updatedAt; 
          delete item.createdAt; 
          delete item.uid; 
          delete item.authProvider;
        }
        if (data !== "signups") {
          delete item.id; 
        }
        if (data === "signups") {
          //delete item.promotedToSLC;
        }
        if (data === "meetings" && specialCode !== 'reset') {
          delete item.attendanceToggle;
          delete item.flag;
          delete item.code;
          item.attendeeCount = item.attendees.length;
          delete item.attendees;
        }
        if (data === "meetings" && specialCode === 'reset') {
          delete item.attendanceToggle;
          item.attendeeCount = item.attendees.length;
        }
        if (specialCode === "signupsPromotion" && item.conf === "SLC") {
          return '';
        }
        if (specialCode === "signupsPromotion") {
          delete item.inHouseRequired;
        }
        return item; 
      });

      if (data==="users") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => usersSortOrder[a] - usersSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="events") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => eventsSortOrder[a] - eventsSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="signups") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => signupsSortOrder[a] - signupsSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="paid_members") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => paidMembersSortOrder[a] - paidMembersSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="meetings") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => meetingsSortOrder[a] - meetingsSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (specialCode === "signupsPromotion") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => signupsPromotionSortOrder[a] - signupsPromotionSortOrder[b]).map(x => { return { [x]: o[x]}})))}

      setDownload(fetched_data);
    }

    awaitFetch(data);
  }, []);

  return (
    <>
      {specialCode==="reset" ? (<CsvDownload className="btn btn-outline-primary" filename={`${data}.csv`} data={download} >Download {specialType} as CSV</CsvDownload>) : (specialCode==="signupsPromotion" ? (<CsvDownload className="btn btn-outline-primary" filename={`signups_promotion_template.csv`} data={download} >Download Signups Promotion Template</CsvDownload>) : (<CsvDownload className="btn btn-light" filename={`${data}.csv`} data={download} >Download as CSV</CsvDownload>))}
    </>
  )
}

export default DownloadFile;
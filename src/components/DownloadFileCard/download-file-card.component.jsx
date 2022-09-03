import { useState, useEffect } from 'react';

import { Card } from "react-bootstrap";

import { downloadCollection } from '../../utils/firebase/firebase.utils';

import CsvDownload from 'react-json-to-csv';

// For downloading Firestore data as JSON: https://stackoverflow.com/questions/71988452/react-button-to-export-data-from-firebase-firestore-database

const DownloadFileCard = ({type, data}) => {    
  const [download, setDownload] = useState([])
  const usersSortOrder = {'name': 1, 'role': 2, 'grade': 3, 'email': 4, 'phoneNo': 5, 'studentNum': 6, 'authProvider': 7};
  const eventsSortOrder = {'Name': 1, 'Category': 2, 'Conference': 3, 'IntroEvent': 4, 'TeamEvent': 5, 'TeamMemberLimit': 6};
  const signupsSortOrder = {'eventName': 1, 'conf': 2, 'member1': 3, 'member2': 4, 'member3': 5, 'member4': 6, 'member5': 7, 'id': 8};
  const paidMembersSortOrder = {'studentNum': 1, 'name': 2, 'email': 3};

  useEffect(() => {
    const awaitFetch = async (collection) => {
      var fetched_data = await downloadCollection(collection);

      fetched_data = fetched_data.map((item) => { 
        if (data==="users") {
          delete item.updatedAt; 
          delete item.createdAt; 
          delete item.uid; 
        }
        if (data !== "signups") {
          delete item.id; 
        }
        if (data === "signups") {
          delete item.promotedToSLC;
        }
        return item; 
      });

      if (data==="users") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => usersSortOrder[a] - usersSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="events") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => eventsSortOrder[a] - eventsSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="signups") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => signupsSortOrder[a] - signupsSortOrder[b]).map(x => { return { [x]: o[x]}})))}
      if (data==="paid_members") {fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => paidMembersSortOrder[a] - paidMembersSortOrder[b]).map(x => { return { [x]: o[x]}})))}
    
      setDownload(fetched_data);
    }

    awaitFetch(data);
  }, []);

  return (
    <>
      <Card className="m-4 mb-2 mt-2">
        <Card.Header>{type}</Card.Header>
        <Card.Body>
          <Card.Title>Download as</Card.Title>
          <div className="space-x-2">
            {/* <ButtonGroup> */}
              {/* <Button variant="outline-primary">PDF</Button> */}
              
            <CsvDownload className="btn btn-outline-primary" filename={`${data}.csv`} data={download} >CSV</CsvDownload>

            {/* </ButtonGroup> */}
          </div>
        </Card.Body>
      </Card>
    </>
  )
}

export default DownloadFileCard;
import {Card, Button } from "react-bootstrap";

import './total-card-count.styles.scss';

import APPLICATION_VARIABLES from '../../settings';

const TotalCountCard = (data) => {
  const data_OBJ = data.data_OBJ;
  const role = data.role;
  // data_OBJ = {
  //   signups_data: [],
  //   signups_path: '',
  //   events_data: [],
  //   events_path: '',
  //   users_data: [],
  //   users_path: '',
  //   paid_members_data: [],
  //   paid_members_path: '',
  // }

  return (
    <Card className="m-3" style={{ maxWidth: '80rem' }}>
        <Card.Header style={{ backgroundColor: APPLICATION_VARIABLES.CARD_HEADER_COLOR, color: APPLICATION_VARIABLES.CARD_HEADER_TEXT_COLOR }}>Statistics</Card.Header>
        <Card.Body>
            <table className='statsTable'>
              <tbody>
                <tr className='table-data'>
                  {role && role !== 'member' && (<td><a href={data_OBJ.signups_path}>{data_OBJ.signups_data ? data_OBJ.signups_data.length : '0'}</a></td>)}
                  {role && role === 'member' && (<td>{data_OBJ.signups_data ? data_OBJ.signups_data.length : '0'}</td>)}

                  {role && role !== 'member' && (<td><a href={data_OBJ.events_path}>{data_OBJ.events_data ? data_OBJ.events_data.length : '0'}</a></td>)}
                  {role && role === 'member' && (<td>{data_OBJ.events_data ? data_OBJ.events_data.length : '0'}</td>)}

                  {role && role !== 'member' && (<td><a href={data_OBJ.users_path}>{data_OBJ.users_data ? data_OBJ.users_data.length : '0'}</a></td>)}
                  {role && role === 'member' && (<td>{data_OBJ.users_data ? data_OBJ.users_data.length : '0'}</td>)}

                  {role && role !== 'member' && (<td><a href={data_OBJ.paid_members_path}>{data_OBJ.paid_members_data ? data_OBJ.paid_members_data.length : '0'}</a></td>)}
                  {role && role === 'member' && (<td>{data_OBJ.paid_members_data ? data_OBJ.paid_members_data.length : '0'}</td>)}
                </tr>
                <tr className='table-labels'>
                  <td>Signups</td>
                  <td>Events</td>
                  <td>Users</td>
                  <td>Paid Members</td>
                </tr>
              </tbody>
            </table>
        </Card.Body>
    </Card>
  )
};

export default TotalCountCard;

{/* <Card className="m-3" style={{ maxWidth: '80rem' }}>
        <Card.Header style={{ backgroundColor: '#577399', color: "white" }}>type</Card.Header>
        <Card.Body>
            <Card.Title style={{fontSize: "35px"}}>{sum}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Total</Card.Subtitle>
            <hr />
            <Button variant="secondary" href={path}>{type}</Button>
        </Card.Body>
    </Card> */}
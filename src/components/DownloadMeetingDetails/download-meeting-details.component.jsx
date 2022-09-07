import { useState, useEffect } from 'react';

import CsvDownload from 'react-json-to-csv';

const DownloadMeetingDetails = ({inputted_data}) => {    
  const [download, setDownload] = useState([])
  const meetingsSortOrder = {'meeting': 1, 'attendees': 2, 'url' : 3};
  const data = {...inputted_data};

  useEffect(() => {
    const awaitFetch = async () => {

      delete data.attendanceToggle;
      delete data.code;
      delete data.id;
      delete data.flag;

      data.meeting = await `${data.name} on ${data.date} from ${data.start_time} to ${data.end_time} with ${data.attendees.length} members`

      delete data.name;
      delete data.date;
      delete data.start_time;
      delete data.end_time;

      var attendeeData = data.attendees;
      delete data.attendees;

      var fetched_data = [data];

      for (var attendee of attendeeData) {
        fetched_data.push({meeting: '', attendees: attendee.email})
      }

      fetched_data = fetched_data.map(o => Object.assign({}, ...Object.keys(o).sort((a, b) => meetingsSortOrder[a] - meetingsSortOrder[b]).map(x => { return { [x]: o[x]}})))

      setDownload(fetched_data);
    }

    awaitFetch();
  }, []);

  return (
    <>
      <CsvDownload className="btn btn-light btn-outline-dark" filename={`meetingDetail.csv`} data={download} >Attendance Details</CsvDownload>
    </>
  )
}

export default DownloadMeetingDetails;
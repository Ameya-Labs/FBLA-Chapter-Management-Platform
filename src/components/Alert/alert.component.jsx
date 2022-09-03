import { useState, useEffect } from 'react';

const NULL_STATE = {
  msg: null,
  type: null,
}

const Alert = (props) => {
  const [data, setData] = useState(props);
  
  useEffect(() => {
    setData(props);
  }, [props])

  return (
    data.alert && <div className={`alert alert-${data.alert.type} alert-dismissible fade show`} role='alert'>
      {data.alert.msg}
      <button type='button' className="btn-close" data-bs-dismiss='alert' aria-label="Close" onClick={() => {setData(NULL_STATE)}}></button>
    </div>
  )
};

export default Alert;
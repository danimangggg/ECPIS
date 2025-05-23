

import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import AssignTask from '../../components/Performance-tracking/TaskAssign';

const AssignTaskPage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/viewContract"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <AssignTask />
    </div>
  )
}

export default AssignTaskPage
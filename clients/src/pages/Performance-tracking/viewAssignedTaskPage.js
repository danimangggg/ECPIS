

import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import AssignedTask from '../../components/Performance-tracking/ViewAssignedTask';

const AssignedTaskPage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/viewContract"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <AssignedTask />
    </div>
  )
}

export default AssignedTaskPage
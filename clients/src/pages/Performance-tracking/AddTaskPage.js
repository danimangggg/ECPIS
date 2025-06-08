

import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import AddTask from '../../components/Performance-tracking/AddTasks';

const AddTaskPage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/all-employee"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <AddTask />
    </div>
  )
}

export default AddTaskPage
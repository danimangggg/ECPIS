

import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import AddEmployee from '../../components/Performance-tracking/AddEmployee';

const AddEmployeePage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/viewContract"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <AddEmployee />
    </div>
  )
}

export default AddEmployeePage
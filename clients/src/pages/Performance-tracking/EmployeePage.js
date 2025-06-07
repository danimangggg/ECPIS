
import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import Employee from '../../components/Performance-tracking/Employee';

const EmployeePage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/viewContract"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <Employee />
    </div>
  )
}

export default EmployeePage
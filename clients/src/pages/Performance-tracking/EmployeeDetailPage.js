
import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import EmployeeDetail from '../../components/Performance-tracking/EmployeeDetail';

const EmployeeDetailPage = () => {
  return (
    <div className='container'>
      <br/>
    <Link to="/viewContract"  >
      <span >
        <FaTimes className='icon' size="30" style={{ marginTop: '10px' }}/>
        </span>
      </Link>
     <br/>
      <EmployeeDetail />
    </div>
  )
}

export default EmployeeDetailPage
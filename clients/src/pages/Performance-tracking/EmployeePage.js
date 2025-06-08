
import {Link } from "react-router-dom";
import {  FaTimes } from 'react-icons/fa'
import Employee from '../../components/Performance-tracking/Employee';
import Navbar2 from '../../components/Navbar/Navbar2'

const EmployeePage = () => {
  return (
    <>

    <Navbar2/>
    <div className='container'>
      <Employee />
    </div>
    </>
  )
}

export default EmployeePage
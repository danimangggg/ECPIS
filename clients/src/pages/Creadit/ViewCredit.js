import CreaditComponent from '../../components/Creadit-Info/CreaditComponent'
import './AddFacilityPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'
import Navbar2 from '../../components/Navbar/Navbar2'

const ViewCreditPage = () => {

  if(localStorage.getItem("token") !== "guest"){
  return (
    <>
    <Navbar2/>
    <div className='container'>
      
     <Link to="/addContract" >
      <span>
        <FaPlusSquare className='addIcon' size="40" />
        </span>
      </Link>
    
     <br/>
      <CreaditComponent/>
    </div>
    </>
  ) }
  else
  {
  return (
    <>
    <Navbar2/>
    <div className='container'>
 
     <br/><br/><br/><br/>
      <CreaditComponent/>
    </div>
    </>
  )}
}

export default ViewCreditPage
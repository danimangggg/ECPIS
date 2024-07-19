import FacilityComponent from '../../../components/facility-info/Facility/DisplayFacility/showFacility'
import './viewFacilityPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'
import Navbar2 from '../../../components/Navbar/Navbar2'


const FacilityInfoPage = () => {

  if(localStorage.getItem("token") !== "guest"){
  return (
    <>
    <Navbar2/>
    <div className='container' >
      
      <Link to="/add-facility" >
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      
      <FacilityComponent/>
      <br/><br/>
    </div>
    </>
  )
  }else{
    return (
      <>
      <Navbar2/>
      <div className='container' >
      
      <br/><br/><br/><br/>
        <FacilityComponent/>
        <br/><br/>
      </div>
      </>
    )
  }
}

export default FacilityInfoPage

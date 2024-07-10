import FacilityComponent from '../../../components/facility-info/Facility/DisplayFacility/showFacility'
import './viewFacilityPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'


const FacilityInfoPage = () => {
  return (
    <div className='container' >
      
      <Link to="/add-facility" >
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      
      <FacilityComponent/>
      <br/><br/>
    </div>
  )
}

export default FacilityInfoPage

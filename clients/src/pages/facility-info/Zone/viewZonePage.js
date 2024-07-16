import ZoneComponent from '../../../components/facility-info/Zone/zoneComponent'
import './viewZonePage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'
import Navbar2 from '../../../components/Navbar/Navbar2'


const FacilityInfoPage = () => {
  return (
    <>
    <Navbar2/>
    <div className='container' >
      
      <Link to="/add-zone">
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      <ZoneComponent/>
    </div>
    </>
  )
}

export default FacilityInfoPage

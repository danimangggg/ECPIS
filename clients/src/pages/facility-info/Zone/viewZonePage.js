import ZoneComponent from '../../../components/facility-info/Zone/zoneComponent'
import './viewZonePage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'


const FacilityInfoPage = () => {
  return (
    <div className='container' >
      
      <Link to="/add-zone">
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      <ZoneComponent/>
    </div>
  )
}

export default FacilityInfoPage

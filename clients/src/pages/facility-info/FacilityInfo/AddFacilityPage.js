import AddFacility from  '../../../components/facility-info/Facility/AddFacility/AddFacility'
import './AddFacilityPage.css'
import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'

const AddFacilityPage = () => {
  return (
    <div>
    <Link to="/facility-profile" >
      <span >
        <FaBackward className='icon' size="30" style={{ marginTop: '60px' }}/>
        </span>
      </Link>
     
     <br/>
      <AddFacility/>
    </div>
  )
}

export default AddFacilityPage
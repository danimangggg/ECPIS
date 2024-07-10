import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'
import UpdatePodComponent from '../../components/Pod/UpdatePodComponent';
import './AddFacilityPage.css'
const AddPodPage = () => {
  return (
    <div>
    <Link to="/viewPod"  >
      <span>
        <FaBackward className='addIcon' size="30" />
        </span>
      </Link>
     <br/>
      <UpdatePodComponent />
    </div>
  )
}

export default AddPodPage
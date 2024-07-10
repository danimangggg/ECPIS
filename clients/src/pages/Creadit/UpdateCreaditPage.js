import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'
import UpdateComponent from '../../components/Creadit-Info/UpdateCreaditComponent';
import './AddFacilityPage.css'
const AddFacilityPage = () => {
  return (
    <div>
    <Link to="/viewContract"  >
      <span>
        <FaBackward className='addIcon' size="30" />
        </span>
      </Link>
     <br/>
      <UpdateComponent />
    </div>
  )
}

export default AddFacilityPage
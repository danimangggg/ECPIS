
import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'
import AddPod from '../../components/Pod/addPodComponent';

const AddPodPage = () => {
  return (
    <div>
    <Link to="/viewPod"  >
      <span >
        <FaBackward className='icon' size="30" style={{ marginTop: '60px' }}/>
        </span>
      </Link>
     <br/>
      <AddPod />
    </div>
  )
}

export default AddPodPage
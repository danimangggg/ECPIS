import PodComponent from '../../components/Pod/viewPodComponent'

import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'

const ViewPodPage = () => {
  return (
    <div className='container'>
     <Link to="/add-Pod" >
      <span>
        <FaPlusSquare className='addIcon' size="40" />
        </span>
      </Link>
     
     <br/>
      <PodComponent/>
    </div>
  )
}

export default ViewPodPage
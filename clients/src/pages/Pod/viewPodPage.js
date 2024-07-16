import PodComponent from '../../components/Pod/viewPodComponent'
import Navbar2 from '../../components/Navbar/Navbar2'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'

const ViewPodPage = () => {
  return (
    <>
    <Navbar2/>
    <div className='container'>
     <Link to="/add-Pod" >
      <span>
        <FaPlusSquare className='addIcon' size="40" />
        </span>
      </Link>
     
     <br/>
      <PodComponent/>
    </div>
    </>
  )
}

export default ViewPodPage
import WoredaComponent from '../../../components/facility-info/Woreda/woredaComponent'
import './viewWoredaPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'
import Navbar2 from '../../../components/Navbar/Navbar2'


const FacilityInfoPage = () => {
  return (
    <>
    <Navbar2/>
    <div className='container' >
      
      <Link to="/add-woreda">
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      <WoredaComponent/>
    </div>
    </>
  )
}

export default FacilityInfoPage

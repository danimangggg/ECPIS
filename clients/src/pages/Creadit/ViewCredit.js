import CreaditComponent from '../../components/Creadit-Info/CreaditComponent'
import './AddFacilityPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'
import Navbar2 from '../../components/Navbar/Navbar2'

const ViewCreditPage = () => {
  return (
    <>
    <Navbar2/>
    <div className='container'>
 
     <br/><br/>
      <CreaditComponent/>
    </div>
    </>
  )
}

export default ViewCreditPage
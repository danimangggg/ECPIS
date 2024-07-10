import WoredaComponent from '../../../components/facility-info/Woreda/addWoreda'
import './woredaPage.css'
import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'

const woreda = () => {
  return (
    <div >
      <Link to="/viewWoreda" >
      <span >
        <FaBackward className='icon' size="30" style={{ marginTop: '60px' }}/>
        </span>
      </Link>
     
     <br/>
      <WoredaComponent  />
    </div>
  )
}

export default woreda

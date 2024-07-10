import AddCreadit from  '../../components/Creadit-Info/AddCreaditComponent'

import {Link } from "react-router-dom";
import {  FaBackward } from 'react-icons/fa'

const AddFacilityPage = () => {
  return (
    <div>
    <Link to="/viewContract"  >
      <span >
        <FaBackward className='icon' size="30" style={{ marginTop: '60px' }}/>
        </span>
      </Link>
     <br/>
      <AddCreadit />
    </div>
  )
}

export default AddFacilityPage
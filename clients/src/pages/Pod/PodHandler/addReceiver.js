import AddReceiverController from '../../../components/Pod/PodHandler/addReceiver'
import {Link} from 'react-router-dom'
import { FaBackward} from 'react-icons/fa'
//import './addPodHandler.css'
const ReceiverPage = () => {
  return (
    <div>
       <Link to="/viewreceiver" >
      <span >
        <FaBackward className='icon' size="30" style={{marginTop: "60px"}}/>
        </span>
      </Link>

      <AddReceiverController/>
    </div>
  )
}

export default ReceiverPage

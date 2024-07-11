import AddReceiverController from '../../../components/Pod/PodHandler/addReceiver'
import {Link} from 'react-router-dom'
import { FaBackward} from 'react-icons/fa'
//import './addPodHandler.css'
const ReceiverPage = () => {
  return (
    <div>
       <Link to="/viewRegisterer" >
      <span >
        <FaBackward className='icon' size="30"/>
        </span>
      </Link>

      <AddReceiverController/>
    </div>
  )
}

export default ReceiverPage

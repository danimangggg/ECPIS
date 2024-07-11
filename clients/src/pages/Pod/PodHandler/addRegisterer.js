import AddRegistererComponent from '../../../components/Pod/PodHandler/addRegisterer'
import {Link} from 'react-router-dom'
import { FaBackward} from 'react-icons/fa'
const RegistererPage = () => {
  return (
    <div>
       <Link to="/viewRegisterer" >
      <span >
        <FaBackward className='icon' size="30"/>
        </span>
      </Link>

      <AddRegistererComponent/>
    </div>
  )
}

export default RegistererPage

import React from 'react'
import RegisterComponent from '../../../components/Pod/PodHandler/viewRegisterer'

import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'


const RegisterPage = () => {
  return (
    <div className='container' >
      
      <Link to="/add-registrant">
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      <div className='table'>
      <RegisterComponent/>
      </div>
    </div>
  )
}

export default RegisterPage

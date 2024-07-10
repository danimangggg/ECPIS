import React from 'react'
import RegionComponent from '../../../components/facility-info/Region/RegionComponent'
import './viewRegionPage.css'
import {Link } from "react-router-dom";
import {  FaPlusSquare } from 'react-icons/fa'


const FacilityInfoPage = () => {
  return (
    <div className='container' >
      
      <Link to="/add-region">
      <span>
        <FaPlusSquare className='addIcon' size="40"/>
        </span>
      </Link>
      <div className='table'>
      <RegionComponent/>
      </div>
    </div>
  )
}

export default FacilityInfoPage

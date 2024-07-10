import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar2.css';
import { SidebarData } from './SidebarData';
import {  FaUser } from 'react-icons/fa'

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [icon, setIcon] = useState("nav__toggler");
  const [dropdown, setDropdown] = useState(false); // State to handle dropdown visibility

  const navToggle = () => {
    if (active === "nav__menu") {
      setActive("nav__menu nav__active");
    } else setActive("nav__menu");

    // Icon Toggler
    if (icon === "nav__toggler") {
      setIcon("nav__toggler toggle");
    } else setIcon("nav__toggler");
  };

  const toggleDropdown = () => {
    setDropdown(!dropdown); // Toggle dropdown visibility
  };

  return (
    <nav className="nav">
      <img src='Epss-logo.png' width={100} alt="Logo" />
      <h2 className="nav__brand">EPSS-1 CMIS</h2>
      <ul className={active}>
        {SidebarData.map((item, index) => (
          <li key={index} className={item.cName}>
            <Link to={item.path}>
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
        {/* Dropdown menu item */}
        <li className="nav__item dropdown">
          
          <span onClick={toggleDropdown}>Contract</span>
          {dropdown && (
            <ul className="dropdown__menu">
              <li className="dropdown__item">
                <Link to="/viewContract">View Contract</Link>
              </li>
              <li className="dropdown__item">
                <Link to="/addContract">Add Contract</Link>
              </li>
              
            </ul>
          )}
        </li>

        <li className="nav__item dropdown">
          
          <span onClick={toggleDropdown}>POD</span>
          {dropdown && (
            <ul className="dropdown__menu">
              <li className="dropdown__item">
                <Link to="/viewPod">View POD</Link>
              </li>
              <li className="dropdown__item">
                <Link to="/add-Pod">Add POD</Link>
              </li>
              
            </ul>
          )}
        </li>

        <li className="nav__item dropdown">   
          <span onClick={toggleDropdown}>Organization Profile</span>
          {dropdown && (
            <ul className="dropdown__menu">
              <li className="dropdown__item">
                <Link to="/facility-profile">Organization</Link>
              </li>
              <li className="dropdown__item">
                <Link to="/viewWoreda">Woreda</Link>
              </li>
              <li className="dropdown__item">
                <Link to="/viewZone">Zone</Link>
              </li>
              <li className="dropdown__item">
                <Link to="/viewRegion">Region</Link>
              </li>
            </ul>
          )}
        </li>

        <li className="nav__item dropdown">   
          <span onClick={toggleDropdown}> <FaUser size="30" color='white' className='icon' /></span>
          {dropdown && (
            <ul className="dropdown__menu">
              <li className="dropdown__item">
                <Link>Change password</Link>
              </li>
              <li className="dropdown__item">
                <Link to = '/loading'>Log out</Link>
              </li>   
            </ul>
          )}
        </li>
      </ul>
      <div onClick={navToggle} className={icon}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </nav>
  );
}

export default Navbar;

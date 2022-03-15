import React from 'react'
import logo from '../../assets/dunkin-logo.png'
import './Navbar.scss'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img className='logo' src={logo} alt=''/>
    </div>
  )
}

export default Navbar
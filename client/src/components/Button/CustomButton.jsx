import React from 'react'
import Button from '@mui/material/Button'
import './CustomButton.scss'

const CustomButton = ({ variant, children, onClick }) => {
  return (
    <Button className='button' variant={variant} onClick={onClick}>{children}</Button>
  )
}

export default CustomButton

import React from 'react'
import './CustomButton.scss'
import Button from '@mui/material/Button'

const CustomButton = ({ variant, children, onClick }) => {
  return (
    <Button className='button' variant={variant} onClick={onClick}>{children}</Button>
  )
}

export default CustomButton

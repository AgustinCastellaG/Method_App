import React from 'react'
import Button from '@mui/material/Button'
import './CustomButton.scss'

const CustomButton = ({ className, variant, children, onClick, disabled }) => {
  return (
    <Button className={`button ${className}`} variant={variant} onClick={onClick} disabled={disabled}>{children}</Button>
  )
}

export default CustomButton

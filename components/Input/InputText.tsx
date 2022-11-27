import type { TextFieldProps } from '@mui/material'
import TextField from '@mui/material/TextField'
import React from 'react'

const InputText: React.FC<TextFieldProps> = ({ label, value, onChange }) => {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
    />
  )
}

export default InputText

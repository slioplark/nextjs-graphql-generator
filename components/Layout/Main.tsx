import { Box } from '@mui/system'
import { ReactNode } from 'react'

interface MainProps {
  children: ReactNode
}

const Main: React.FC<MainProps> = ({ children }) => {
  return (
    <Box component="main" p="16px">
      {children}
    </Box>
  )
}

export default Main

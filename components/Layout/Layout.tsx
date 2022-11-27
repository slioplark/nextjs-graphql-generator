import React, { ReactNode } from 'react'
import Main from './Main'
import Navbar from './Navbar'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <Main>{children}</Main>
    </>
  )
}

export default Layout

import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          GraphQL Generator
        </Typography>

        <Link href="/query">
          <Button color="inherit">Query</Button>
        </Link>

        <Link href="/mutation">
          <Button color="inherit">Mutation</Button>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

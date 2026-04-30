import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';

import './App.css'
import Main from './pages/Main';
import About from './pages/About';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Posts from './pages/Posts';
import { darkTheme, theme } from './Themes';
import ProductsAddEdit from './pages/ProductsAddEdit';
import PostsAddEdit from './pages/PostAddEdit';
import OrdersAddEdit from './pages/OrderAddEdit';
import { loadSession, logout, session } from './auth/Session';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

type PageRoute = {
  page: string,
  route: string,
}

const pages: PageRoute[] = [
  { page: 'About', route: '/about' },
  { page: 'Products', route: '/products' },
  { page: 'Orders', route: '/orders' },
  { page: 'Blog', route: '/blog' },
]
const settings: PageRoute[] = [
  { page: 'Sign Up', route: '/signup' },
  { page: 'Login', route: '/login' },
]
const settingsUser: PageRoute[] = [
  { page: 'Change password', route: '/password' },
  { page: 'Logout', route: '/logout' },
]

function App() {

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const navigate = useNavigate()

  React.useEffect(() => {
    loadSession()
  }, [])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleNavMenu = (page: string) => {
    //alert(page)
    navigate(page)
    setAnchorElNav(null);
  };

  const handleCloseNavMenu = (page: string) => {
    if (page) {
      navigate(page.toLowerCase())
    }
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (page?: string) => {
    setAnchorElUser(null)
    if (!page) {
      return
    }
    if (page === '/logout') {
      logout()
      return
    }
    navigate(page)
  };

  const dark = false

  return (
    <ThemeProvider theme={dark ? darkTheme : theme}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <CssBaseline />
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.page} onClick={() => handleNavMenu(page.route)}>
                    <Typography sx={{ textAlign: 'center' }}>{page.page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.page}
                  onClick={() => handleNavMenu(page.route)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.page}
                </Button>
              ))}
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={() => handleCloseUserMenu()}
              >
                <Typography>{session.email}</Typography>
                {(session.email ? settingsUser : settings).map((setting) => (
                  <MenuItem key={setting.page} onClick={() => handleCloseUserMenu(setting.route)}>
                    <Typography sx={{ textAlign: 'center' }}>{setting.page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/about' element={<About />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<SignIn />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:id' element={<ProductsAddEdit />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/orders/:id' element={<OrdersAddEdit />} />
        <Route path='/blog' element={<Posts />} />
        <Route path='/blog/:id' element={<PostsAddEdit />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App

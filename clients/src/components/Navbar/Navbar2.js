import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  AddCircleOutline,
  VpnKey,
  ExitToApp,
  Edit,
} from '@mui/icons-material';
import { SidebarData } from './SidebarData';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownMenu = (event, menuId) => {
    setDropdownAnchorEl(event.currentTarget);
    setOpenMenuId(menuId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDropdownAnchorEl(null);
    setOpenMenuId(null);
  };

  const signOut = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const addUser = () => {
    navigate('/add-users');
  };

  const userList = () => {
    navigate('/users');
  };


  const resetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" style={{ backgroundColor: "black" }} sx={{ zIndex: 1300 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              style: {
                marginTop: '40px',
              },
            }}
          >
            {SidebarData.map((item, index) => (
              <MenuItem key={index} onClick={handleClose}>
                <Link to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {item.title}
                </Link>
              </MenuItem>
            ))}
          </Menu>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EPSS-1 CMIS
          </Typography>

          <Button
            color="inherit"
            component={Link}
            to="/viewContract"
            sx={{ marginLeft: 2 }}
          >
            Contract
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/viewPod"
            sx={{ marginLeft: 2 }}
          >
            POD
          </Button>

          <Button
            color="inherit"
            onClick={(e) => handleDropdownMenu(e, 'orgProfile')}
            sx={{ marginLeft: 2 }}
          >
            Org Profile
          </Button>
          <Menu
            anchorEl={dropdownAnchorEl}
            open={openMenuId === 'orgProfile'}
            onClose={handleClose}
            PaperProps={{
              style: {
                marginTop: '40px',
                zIndex: 1301,
              },
            }}
          >
            <MenuItem onClick={handleClose}>
              <Link to="/facility-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                Organization
              </Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to="/viewWoreda" style={{ textDecoration: 'none', color: 'inherit' }}>
                Woreda
              </Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to="/viewZone" style={{ textDecoration: 'none', color: 'inherit' }}>
                Zone
              </Link>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Link to="/viewRegion" style={{ textDecoration: 'none', color: 'inherit' }}>
                Region
              </Link>
            </MenuItem>
          </Menu>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={(e) => handleDropdownMenu(e, 'account')}
            color="inherit"
            sx={{ marginLeft: 2 }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={dropdownAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={openMenuId === 'account'}
            onClose={handleClose}
            PaperProps={{
              style: {
                marginTop: '40px',
                zIndex: 1301,
              },
            }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>{localStorage.getItem('FullName')}</ListItemText>
            </MenuItem>
            <Divider />
            {localStorage.getItem("AccountType") === "Admin" && (
              <>
               <MenuItem onClick={userList}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Users</ListItemText>
                </MenuItem>
                <MenuItem onClick={addUser}>
                  <ListItemIcon>
                    <AddCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add User</ListItemText>
                </MenuItem>
                <MenuItem onClick={resetPassword}>
                  <ListItemIcon>
                    <VpnKey fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reset Password</ListItemText>
                </MenuItem>
                <Divider />
              </>
            )}

    {localStorage.getItem("token") !== "guest" ?
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Link to="/change-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Change Password
                </Link>
              </ListItemText>
            </MenuItem> : null
              }

        {localStorage.getItem("token") !== "guest" ?
            <MenuItem onClick={signOut}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Log Out
                </Link>
              </ListItemText>
            </MenuItem> : 

             <MenuItem onClick={signOut}>
             <ListItemIcon>
               <ExitToApp fontSize="small" />
             </ListItemIcon>
             <ListItemText>
               <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                 Log In
               </Link>
             </ListItemText>
           </MenuItem>
            }
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* This Toolbar component creates space for the fixed AppBar */}
    </Box>
  );
};

export default Navbar;

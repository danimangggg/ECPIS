import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  Box,
  Divider,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Home,
  Assignment,
  Business,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  AddCircleOutline,
  VpnKey,
  ExitToApp,
  Group,
  Settings,
  Task,
  FormatListBulleted,
  PlaylistAddCheckCircle,
  PlaylistAdd
} from '@mui/icons-material';

const drawerWidth = 260;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [orgProfileOpen, setOrgProfileOpen] = useState(false);
  const [assessmentAnchorEl, setAssessmentAnchorEl] = useState(null);

  const navigate = useNavigate();

  const handleOrgProfileToggle = () => {
    setOrgProfileOpen(!orgProfileOpen);
  };

  const handleAssessmentMenuOpen = (event) => {
    setAssessmentAnchorEl(event.currentTarget);
  };

  const handleAssessmentMenuClose = () => {
    setAssessmentAnchorEl(null);
  };

  const signOut = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const accountType = localStorage.getItem("AccountType");
  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("FullName");

  const handleMouseEnter = () => setCollapsed(false);
  const handleMouseLeave = () => setCollapsed(true);

  const MenuTooltip = ({ title, children }) => (
    <Tooltip title={collapsed ? title : ''} placement="right" enterDelay={300}>
      {children}
    </Tooltip>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        anchor="left"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: collapsed ? 70 : drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: collapsed ? 70 : drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1a1a1a',
            color: 'white',
            overflowX: 'hidden',
            transition: 'width 0.3s ease-in-out',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', bgcolor: '#121212' }}>
          {!collapsed && (
            <Typography variant="h6" fontWeight="bold">
              EPSS - Hub 1
            </Typography>
          )}
        </Toolbar>

        <List>
          <MenuTooltip title="Self Assessment">
            <ListItem button onClick={handleAssessmentMenuOpen}>
              <ListItemIcon><Assignment sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary="Self Assessment" />}
              {!collapsed && (assessmentAnchorEl ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
          </MenuTooltip>
          <Menu
            anchorEl={assessmentAnchorEl}
            open={Boolean(assessmentAnchorEl)}
            onClose={handleAssessmentMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem component={Link} to="/all-employee" onClick={handleAssessmentMenuClose}>
              <FormatListBulleted sx={{ mr: 1 }} /> All Assessment
            </MenuItem>
            <MenuItem component={Link} to="/assigned-task" onClick={handleAssessmentMenuClose}>
              <Task sx={{ mr: 1 }} /> My Tasks
            </MenuItem>
            <MenuItem component={Link} to="/add-task" onClick={handleAssessmentMenuClose}>
              <Task sx={{ mr: 1 }} /> Add Tasks
            </MenuItem>
            <MenuItem component={Link} to="/team-tasks" onClick={handleAssessmentMenuClose}>
              <PlaylistAddCheckCircle sx={{ mr: 1 }} /> Team Tasks
            </MenuItem>
            <MenuItem component={Link} to="/assign-task" onClick={handleAssessmentMenuClose}>
              <PlaylistAdd sx={{ mr: 1 }} /> Assign Tasks
            </MenuItem>
          </Menu>

          <MenuTooltip title="Contract">
            <ListItem button component={Link} to="/viewContract">
              <ListItemIcon><Business sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary="Contract" />}
            </ListItem>
          </MenuTooltip>

          <MenuTooltip title="POD">
            <ListItem button component="a" href="https://model19-b49f4.web.app/login" target="_blank">
              <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary="POD" />}
            </ListItem>
          </MenuTooltip>

          <MenuTooltip title="Org Profile">
            <ListItem button onClick={handleOrgProfileToggle}>
              <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary="Org Profile" />}
              {!collapsed && (orgProfileOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
          </MenuTooltip>

          <Collapse in={orgProfileOpen && !collapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              <ListItem button component={Link} to="/facility-profile">
                <ListItemText primary="Facility Profile" />
              </ListItem>
              <ListItem button component={Link} to="/viewWoreda">
                <ListItemText primary="Woreda" />
              </ListItem>
              <ListItem button component={Link} to="/viewZone">
                <ListItemText primary="Zone" />
              </ListItem>
              <ListItem button component={Link} to="/viewRegion">
                <ListItemText primary="Region" />
              </ListItem>
            </List>
          </Collapse>
        </List>

        <Divider sx={{ my: 2, bgcolor: '#333' }} />

        <List sx={{ mt: 'auto' }}>
          <ListItem>
            <ListItemIcon><AccountCircle sx={{ color: 'white' }} /></ListItemIcon>
            {!collapsed && <ListItemText primary={fullName || 'Guest'} />}
          </ListItem>

          {accountType === "Admin" && !collapsed && (
            <>
              <ListItem button component={Link} to="/users">
                <ListItemIcon><Group sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem button component={Link} to="/add-users">
                <ListItemIcon><AddCircleOutline sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Add User" />
              </ListItem>
              <ListItem button component={Link} to="/reset-password">
                <ListItemIcon><VpnKey sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Reset Password" />
              </ListItem>
            </>
          )}

          {!collapsed && token !== "guest" && (
            <ListItem button component={Link} to="/change-password">
              <ListItemIcon><VpnKey sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItem>
          )}

          <ListItem button onClick={signOut}>
            <ListItemIcon><ExitToApp sx={{ color: 'white' }} /></ListItemIcon>
            {!collapsed && <ListItemText primary={token !== "guest" ? "Log Out" : "Log In"} />}
          </ListItem>
        </List>
      </Drawer>

    </Box>
  );
};

export default Sidebar;

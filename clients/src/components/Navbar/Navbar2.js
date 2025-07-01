import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Tooltip,
  IconButton,
  Select,
  MenuItem as MuiMenuItem
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
  PlaylistAdd,
  Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 260;
// ...imports stay the same

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [orgProfileOpen, setOrgProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [assessmentAnchorEl, setAssessmentAnchorEl] = useState(null);
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const handleToggleSidebar = () => setCollapsed(!collapsed);
  const handleOrgProfileToggle = () => setOrgProfileOpen(!orgProfileOpen);
  const handleLangToggle = () => setLangOpen(!langOpen);
  const handleAssessmentMenuOpen = (event) => setAssessmentAnchorEl(event.currentTarget);
  const handleAssessmentMenuClose = () => setAssessmentAnchorEl(null);

  const signOut = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const accountType = localStorage.getItem("AccountType");
  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("FullName");

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
        sx={{
          width: collapsed ? 70 : drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: collapsed ? 70 : drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'black',
            color: 'white',
            overflowX: 'hidden',
            transition: 'width 0.3s ease-in-out',
            position: 'fixed',
            height: '100vh',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between', bgcolor: 'red', px: 2 }}>
          {!collapsed && (
            <Typography variant="h6" fontWeight="bold">
              EPSS - Hub 1
            </Typography>
          )}
          <IconButton onClick={handleToggleSidebar} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>

        <List>
          {/* Self Assessment */}
          <MenuTooltip title={t("Self Assesment")}>
            <ListItem button onClick={handleAssessmentMenuOpen}>
              <ListItemIcon><Assignment sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={t("Self Assesment")} />}
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
              <FormatListBulleted sx={{ mr: 1 }} /> {t("All Assesment")}
            </MenuItem>
            <MenuItem component={Link} to="/assigned-task" onClick={handleAssessmentMenuClose}>
              <Task sx={{ mr: 1 }} /> {t("My Tasks")}
            </MenuItem>
            <MenuItem component={Link} to="/add-task" onClick={handleAssessmentMenuClose}>
              <Task sx={{ mr: 1 }} /> {t("Add Tasks")}
            </MenuItem>
            <MenuItem component={Link} to="/team-tasks" onClick={handleAssessmentMenuClose}>
              <PlaylistAddCheckCircle sx={{ mr: 1 }} /> {t("Team Tasks")}
            </MenuItem>
            <MenuItem component={Link} to="/assign-task" onClick={handleAssessmentMenuClose}>
              <PlaylistAdd sx={{ mr: 1 }} /> {t("Assign Tasks")}
            </MenuItem>
            <MenuItem component={Link} to="/users" onClick={handleAssessmentMenuClose}>
              <PlaylistAdd sx={{ mr: 1 }} /> {t("Employee Profile")}
            </MenuItem>
          </Menu>

          {/* Contract & POD - Only if NOT Self Assessment */}
          {accountType !== 'Self Assesment' && (
            <>
              <MenuTooltip title={t("Contract")}>
                <ListItem button component={Link} to="/viewContract">
                  <ListItemIcon><Business sx={{ color: 'white' }} /></ListItemIcon>
                  {!collapsed && <ListItemText primary={t("Contract")} />}
                </ListItem>
              </MenuTooltip>

              <MenuTooltip title={t("POD")}>
                <ListItem button component="a" href="https://model19-b49f4.web.app/login" target="_blank">
                  <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
                  {!collapsed && <ListItemText primary={t("POD")} />}
                </ListItem>
              </MenuTooltip>
            </>
          )}

          {/* Org Profile Section */}
          <MenuTooltip title={t("Org Profile")}>
            <ListItem button onClick={handleOrgProfileToggle}>
              <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && <ListItemText primary={t("Org Profile")} />}
              {!collapsed && (orgProfileOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
          </MenuTooltip>

          <Collapse in={orgProfileOpen && !collapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              <ListItem button component={Link} to="/facility-profile">
                <ListItemText primary={t("Facility Profile")} />
              </ListItem>
              <ListItem button component={Link} to="/viewWoreda">
                <ListItemText primary={t("Woreda")} />
              </ListItem>
              <ListItem button component={Link} to="/viewZone">
                <ListItemText primary={t("Zone")} />
              </ListItem>
              <ListItem button component={Link} to="/viewRegion">
                <ListItemText primary={t("Region")} />
              </ListItem>
            </List>
          </Collapse>

          {/* Language Switch */}
          <MenuTooltip title={t("Language")}>
            <ListItem>
              <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
              {!collapsed && (
                <select
                  value={i18n.language}
                  onChange={(e) => handleChangeLanguage(e.target.value)}
                  style={{
                    background: 'black',
                    color: 'white',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                  }}
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ</option>
                </select>
              )}
            </ListItem>
          </MenuTooltip>
        </List>

        <Divider sx={{ my: 2, bgcolor: '#333' }} />

        {/* Footer */}
        <List sx={{ mt: 'auto' }}>
          <ListItem>
            <ListItemIcon><AccountCircle sx={{ color: 'white' }} /></ListItemIcon>
            {!collapsed && <ListItemText primary={fullName || 'Guest'} />}
          </ListItem>

          {accountType === "Admin" && !collapsed && (
            <>
              <ListItem button component={Link} to="/users">
                <ListItemIcon><Group sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary={t("Users")} />
              </ListItem>
              <ListItem button component={Link} to="/add-users">
                <ListItemIcon><AddCircleOutline sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary={t("Add User")} />
              </ListItem>
              <ListItem button component={Link} to="/reset-password">
                <ListItemIcon><VpnKey sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary={t("Reset Password")} />
              </ListItem>
            </>
          )}

          {!collapsed && token !== "guest" && (
            <ListItem button component={Link} to="/change-password">
              <ListItemIcon><VpnKey sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary={t("Change Password")} />
            </ListItem>
          )}

          <ListItem button onClick={signOut}>
            <ListItemIcon><ExitToApp sx={{ color: 'white' }} /></ListItemIcon>
            {!collapsed && <ListItemText primary={token !== "guest" ? t("Log Out") : t("Log In")} />}
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;


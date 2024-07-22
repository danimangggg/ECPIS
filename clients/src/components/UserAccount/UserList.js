import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Toolbar,
  AppBar,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Paper,
  Container,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

const UserList = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/deleteUser/${selectedUser.id}`);
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setOpenDialog(false);
      setSelectedUser(null);
     
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };
  const handleBack = () => {
    window.history.back();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleBack}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ mb: 2, textAlign: 'center' }}>
          User List
        </Typography>
        <List>
          {users.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={`Username: ${user.user_name} | Account Type: ${user.account_type}`}
                />
                {
                  user.account_type !== "Admin" ?
                <ListItemSecondaryAction>
                  <IconButton style={{color: 'red'}} edge="end" aria-label="delete" onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction> : null
                  }
              </ListItem>
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        <Dialog open={openDialog} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserList;

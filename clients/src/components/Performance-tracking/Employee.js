import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as PlusIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        // Filter only Self Assessment users
        const selfAssessmentUsers = response.data.filter(
          (user) => user.account_type === 'Self Assesment'
        );
        setUsers(selfAssessmentUsers);
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


  const handleBack = () => {
    window.history.back();
  };

  const handleAdd = () => {
    navigate('/add-users');
  };

  // Navigate to detail and pass user data in state
  const handleView = (user) => {
    navigate(`/employee-detail/${user.id}`, { state: { user } });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'first_name', headerName: 'First Name', flex: 1 },
    { field: 'last_name', headerName: 'Last Name', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1, valueGetter: (params) => params.row.department || '-' },
    { field: 'position', headerName: 'Position', flex: 1, valueGetter: (params) => params.row.position || '-' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleView(params.row)}
            sx={{ mr: 1 }}
          >
            View
          </Button>
         
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
        <IconButton
          edge="end"
          onClick={handleBack}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label="go back"
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          edge="start"
          onClick={handleAdd}
          sx={{ position: 'absolute', top: 8, left: 8, color: "green" }}
          aria-label="add user"
        >
          <PlusIcon />
        </IconButton>

        <Typography variant="h5" align="center" gutterBottom>
          Self Assessment Employee List
        </Typography>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
            disableSelectionOnClick
          />
        </Box>

      </Paper>
    </Container>
  );
};

export default UserList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { Add as PlusIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);

        const selfAssessmentUsers = userRes.data.filter(
          (user) => user.account_type === 'Self Assesment'
        );

        const enhancedUsers = selfAssessmentUsers.map((user, index) => ({
          ...user,
          userId: user.id,          // Keep original ID
          id: index + 1,            // Use serial for DataGrid row ID
          serialId: index + 1,
        }));

        setUsers(enhancedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    navigate('/add-users');
  };

  const handleView = (user) => {
    navigate(`/employee-detail/${user.userId}`, { state: { user } }); // Use original ID
  };

  const columns = [
    {
      field: 'serialId',
      headerName: 'No',
      width: 70,
      headerClassName: 'bold-header',
    },
    {
      field: 'first_name',
      headerName: 'First Name',
      flex: 1,
      headerClassName: 'bold-header',
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      flex: 1,
      headerClassName: 'bold-header',
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      headerClassName: 'bold-header',
      valueGetter: (params) => params.row.department || '-',
    },
    {
      field: 'position',
      headerName: 'Position',
      flex: 1,
      headerClassName: 'bold-header',
      valueGetter: (params) => params.row.position || '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'bold-header',
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleView(params.row)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, backgroundColor: '#fafafa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Self Assessment Employee List
          </Typography>
          <IconButton onClick={handleAdd} sx={{ color: 'green' }}>
            <PlusIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: 520,
            width: '100%',
            '& .bold-header': {
              fontWeight: 'bold',
            },
          }}
        >
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default UserList;

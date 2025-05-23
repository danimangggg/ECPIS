import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import axios from 'axios';

const TaskAssign = ({ currentUser }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [tasks, setTasks] = useState([
    { description: '', measurement: 'Percentage', target: '' }
  ]);

  // Fetch users based on current user position
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || !currentUser.position) return;

      const role =
        currentUser.position === 'Manager'
          ? 'Coordinator'
          : currentUser.position === 'Coordinator'
          ? 'Officer'
          : null;

      if (!role) return;

      try {
        const res = await axios.get(`http://localhost:3001/api/users?role=${role}`);
        setAvailableUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { description: '', measurement: 'Percentage', target: '' }]);
  };

  const handleSubmit = async () => {
    if (!selectedUserId || tasks.some(t => !t.description || !t.target)) {
      alert('Please complete all fields and select a user.');
      return;
    }

    try {
      const payload = {
        assignedBy: currentUser.id,
        assignedTo: selectedUserId,
        tasks,
      };

      const res = await axios.post('http://localhost:3001/api/assignTask', payload);
      alert('Tasks assigned successfully!');
      setSelectedUserId('');
      setTasks([{ description: '', measurement: 'Percentage', target: '' }]);
    } catch (error) {
      console.error('Error submitting task assignment:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom mt={4}>
        Assign Tasks
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Select
          fullWidth
          value={selectedUserId}
          displayEmpty
          onChange={(e) => setSelectedUserId(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="" disabled>
            Select a {currentUser?.position === 'Manager' ? 'Coordinator' : 'Officer'}
          </MenuItem>
          {availableUsers.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.fullName} ({user.position})
            </MenuItem>
          ))}
        </Select>

        {tasks.map((task, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Description"
                value={task.description}
                onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label="Measurement"
                value={task.measurement}
                onChange={(e) => handleTaskChange(index, 'measurement', e.target.value)}
              >
                <MenuItem value="Percentage">Percentage</MenuItem>
                <MenuItem value="Number">Number</MenuItem>
                <MenuItem value="Time">Time</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Target"
                value={task.target}
                onChange={(e) => handleTaskChange(index, 'target', e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button onClick={handleAddTask} variant="outlined">
            Add Another Task
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Assign Tasks
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TaskAssign;

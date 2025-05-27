import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Box,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TaskAssign = ({ currentUser }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [tasks, setTasks] = useState([{ description: '' }]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchEmployees = async () => {
      if (!currentUser || !currentUser.position) {
        setLoading(false);
        return;
      }

      try {
        let response;
        if (currentUser.position === 'Manager') {
          response = await axios.get('/api/employees/coordinators');
        } else if (currentUser.position === 'Coordinator') {
          response = await axios.get(`/api/employees/officers/${currentUser.department}`);
        }

        if (response && response.data) {
          setEmployees(response.data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentUser]);

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index].description = value;
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { description: '' }]);
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId || tasks.some(t => !t.description.trim())) {
      alert('Please select an employee and fill in all tasks.');
      return;
    }

    try {
      const payload = {
        assignerId: currentUser.id,
        assigneeId: selectedEmployeeId,
        tasks: tasks.map(t => t.description)
      };

      await axios.post('/api/taskAssignments', payload);
      alert('Tasks assigned successfully!');
      setSelectedEmployeeId('');
      setTasks([{ description: '' }]);
    } catch (error) {
      console.error('Error submitting tasks:', error);
      alert('Failed to assign tasks.');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!currentUser) {
    return <Typography color="error">Error: User information is missing.</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Assign Tasks
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box mb={2}>
          <Typography variant="subtitle1">
            <strong>User:</strong> {currentUser.first_name} {currentUser.last_name}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Position:</strong> {currentUser.position}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Department:</strong> {currentUser.department}
          </Typography>
        </Box>

        <TextField
          select
          fullWidth
          label={
            currentUser.position === 'Manager'
              ? 'Select Coordinator'
              : 'Select Officer'
          }
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          sx={{ mb: 3 }}
        >
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name}
            </MenuItem>
          ))}
        </TextField>

        {tasks.map((task, index) => (
          <TextField
            key={index}
            fullWidth
            label={`Task ${index + 1}`}
            value={task.description}
            onChange={(e) => handleTaskChange(index, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}

        <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            variant="outlined"
          >
            Add Another Task
          </Button>
        </Box>

        <Button variant="contained" onClick={handleSubmit}>
          Assign Tasks
        </Button>
      </Paper>
    </Container>
  );
};

export default TaskAssign;

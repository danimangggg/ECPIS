import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const TaskAssign = () => {
  const FullName = localStorage.getItem('FullName');
  const Department = localStorage.getItem('Department');
  const Position = localStorage.getItem('Position');

  const [allUsers, setAllUsers] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
        setAllUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`);
        setAllTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchUsers();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (Position === 'Manager') {
      const coordinators = allUsers.filter(user => user.position === 'Coordinator');
      setFilteredEmployees(coordinators);
    } else if (Position === 'Coordinator') {
      const officers = allUsers.filter(
        user => user.position === 'Officer' && user.department === Department
      );
      setFilteredEmployees(officers);
    }
  }, [allUsers, Position, Department]);

  useEffect(() => {
    const departmentTasks = allTasks.filter(
      task => task.department === Department
    );
    setFilteredTasks(departmentTasks);
  }, [allTasks, Department]);

  const handleEmployeeSelect = (event) => {
    setSelectedEmployeeId(event.target.value);
  };

  const handleTaskSelect = (event) => {
    setSelectedTaskIds(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId || selectedTaskIds.length === 0) {
      alert('Please select one employee and at least one task.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/assignTask`, {
        employeeId: selectedEmployeeId,
        taskIds: selectedTaskIds,
      });
      alert('Tasks assigned successfully!');
      setSelectedEmployeeId('');
      setSelectedTaskIds([]);
    } catch (err) {
      console.error('Error assigning tasks:', err);
      alert('Failed to assign tasks.');
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
        <IconButton
          edge="end"
          onClick={handleBack}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" align="center" gutterBottom>
          Assign Tasks
        </Typography>

        <Typography variant="subtitle1" align="center" gutterBottom>
          {FullName} | {Position} | {Department}
        </Typography>

        {/* Select One Employee */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Employee</InputLabel>
          <Select
            value={selectedEmployeeId}
            onChange={handleEmployeeSelect}
            label="Select Employee"
          >
            {filteredEmployees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

              {/* Select Multiple Tasks */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Tasks</InputLabel>
          <Select
            multiple
            value={selectedTaskIds}
            onChange={(e) => setSelectedTaskIds(e.target.value.map(Number))}
            renderValue={(selected) =>
              filteredTasks
                .filter(task => selected.includes(task.id))
                .map(task => task.description)
                .join(', ')
            }
          >
            {filteredTasks.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                <Checkbox checked={selectedTaskIds.includes(task.id)} />
                <ListItemText primary={task.description} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>


        <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
          Assign Tasks
        </Button>
      </Paper>
    </Container>
  );
};

export default TaskAssign;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
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
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [dailyTarget, setDailyTarget] = useState('');

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
      const officers = allUsers.filter(user =>
        user.position === 'Officer' && user.department === Department
      );
      setFilteredEmployees(officers);
    }
  }, [allUsers, Position, Department]);

  useEffect(() => {
    const departmentTasks = allTasks.filter(task => task.department === Department);
    setFilteredTasks(departmentTasks);
  }, [allTasks, Department]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !selectedTaskId || !dailyTarget) {
      alert('Please select an employee, a task, and enter the daily target.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/assignTask`, {
        employeeId: selectedEmployeeId,
        taskId: selectedTaskId,
        dailyTarget: Number(dailyTarget),
      });
      alert('Task assigned successfully!');
      setSelectedTaskId('');
      setDailyTarget('');
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Failed to assign task.');
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
          Assign Task
        </Typography>

        <Typography variant="subtitle1" align="center" gutterBottom>
          {FullName} | {Position} | {Department}
        </Typography>

        {/* Select Employee */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Employee</InputLabel>
          <Select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            renderValue={(selected) =>
              filteredEmployees.find(emp => emp.id === selected)
                ? `${filteredEmployees.find(emp => emp.id === selected).first_name} ${filteredEmployees.find(emp => emp.id === selected).last_name}`
                : ''
            }
          >
            {filteredEmployees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select Task */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Task</InputLabel>
          <Select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            renderValue={(selected) =>
              filteredTasks.find(task => task.id === selected)?.description || ''
            }
          >
            {filteredTasks.map((task) => (
              <MenuItem key={task.id} value={task.id}>
                {task.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Daily Target */}
        <TextField
          fullWidth
          label="Daily Target"
          type="number"
          value={dailyTarget}
          onChange={(e) => setDailyTarget(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth sx={{ mb: 1 }}>
          Assign Task
        </Button>

        <Button onClick={() => {
          setSelectedTaskId('');
          setDailyTarget('');
        }} variant="outlined" color="secondary" fullWidth>
          Add Another Task
        </Button>
      </Paper>
    </Container>
  );
};

export default TaskAssign;

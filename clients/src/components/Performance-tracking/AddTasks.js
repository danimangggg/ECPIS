import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Box,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const departmentOptions = [
  'ICT Department',
  'Finance',
  'Human Resource',
  'Transport Management',
  'Demand',
  'EWM'
];

const AddTaskForm = () => {
  const [department, setDepartment] = useState('');
  const [tasks, setTasks] = useState(['']);

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleRemoveTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!department || tasks.some((task) => !task.trim())) {
      alert('Please select a department and fill all task fields.');
      return;
    }

    const payload = {
      department,
      tasks
    };

    // Replace this with your actual POST request
    console.log('Submitting:', payload);

    // Reset form after submission
    setDepartment('');
    setTasks(['']);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Department Tasks
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <TextField
          select
          fullWidth
          label="Select Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          sx={{ mb: 3 }}
        >
          {departmentOptions.map((dept, idx) => (
            <MenuItem key={idx} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>

        {tasks.map((task, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              label={`Task ${index + 1}`}
              value={task}
              onChange={(e) => handleTaskChange(index, e.target.value)}
            />
            {tasks.length > 1 && (
              <IconButton
                onClick={() => handleRemoveTask(index)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
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
          Submit Tasks
        </Button>
      </Paper>
    </Container>
  );
};

export default AddTaskForm;

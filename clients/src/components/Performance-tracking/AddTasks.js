import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Box,
  IconButton,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const departmentOptions = [
  'ICT Department',
  'Finance',
  'Human Resource',
  'Transport Management',
  'Demand',
  'EWM',
];

const measurementOptions = ['Percentage', 'Number', 'Time'];

const AddTaskForm = () => {
  const [department, setDepartment] = useState('');
  const [tasks, setTasks] = useState([
    { description: '', measurement: 'Percentage', target: '' },
  ]);

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      { description: '', measurement: 'Percentage', target: '' },
    ]);
  };

  const handleRemoveTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = async () => {
    if (
      !department ||
      tasks.some(
        (task) => !task.description.trim() || !task.target.trim()
      )
    ) {
      alert('Please fill all fields for every task and select a department.');
      return;
    }

    try {
      // Send POST request for each task
      await Promise.all(
        tasks.map((task) =>
          axios.post(`${process.env.REACT_APP_API_URL}/api/addTask`, {
            ...task,
            department,
          })
        )
      );

      alert('Tasks successfully submitted!');

      // Reset form
      setDepartment('');
      setTasks([{ description: '', measurement: 'Percentage', target: '' }]);
    } catch (error) {
      console.error('Error submitting tasks:', error);
      alert('There was an error submitting the tasks.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
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
          required
        >
          {departmentOptions.map((dept, idx) => (
            <MenuItem key={idx} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>

        {tasks.map((task, index) => (
          <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 2 }}>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label={`Task ${index + 1}`}
                value={task.description}
                onChange={(e) =>
                  handleTaskChange(index, 'description', e.target.value)
                }
                required
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                select
                label="Measurement"
                fullWidth
                value={task.measurement}
                onChange={(e) =>
                  handleTaskChange(index, 'measurement', e.target.value)
                }
              >
                {measurementOptions.map((option, i) => (
                  <MenuItem key={i} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Target"
                value={task.target}
                onChange={(e) =>
                  handleTaskChange(index, 'target', e.target.value)
                }
                required
              />
            </Grid>
            <Grid item xs={1}>
              {tasks.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveTask(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
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

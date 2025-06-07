import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Divider,
  Grid,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('month'));
  const [rangeEnd, setRangeEnd] = useState(dayjs());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('http://localhost:3001/api/users');
        const foundUser = userRes.data.find(u => u.id === parseInt(id));
        setUser(foundUser);
        console.log('Found User:', foundUser);

        const tasksRes = await axios.get(`http://localhost:3001/api/viewAssignedTask`);
        const userAssignedTasks = tasksRes.data.filter(task => task.userId === foundUser.id);
        setAssignedTasks(userAssignedTasks);
        console.log('Assigned Tasks:', userAssignedTasks);

        const achRes = await axios.get(`http://localhost:3001/api/get-achievements`);
        setAchievements(achRes.data);
        console.log('All Achievements:', achRes.data);

        const allTasksRes = await axios.get(`http://localhost:3001/api/tasks`);
        setTasks(allTasksRes.data);
        console.log('All Task Descriptions:', allTasksRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');
  const selected = new Date(selectedDate).toISOString().split("T")[0];
  console.log(selected)
  
  const filteredAchievementsByDay = assignedTasks.map(task => {
    const found = achievements.find(a =>
      String(a.assignmentId) === String(task.id) && formatDate(a.date) === formatDate(selected)
    );
    console.log(`Task ${task.id} (AssignmentId) Achievement on selected day:`, found);
    return {
      ...task,
      achieved: found ? found.achieved : 0
    };
  });

  const filteredAchievementsByRange = assignedTasks.map(task => {
    const achievementSum = achievements
      .filter(a => {
        const date = dayjs(a.date);
        return (
          String(a.assignmentId) === String(task.id) &&
          date.isAfter(rangeStart.subtract(1, 'day')) &&
          date.isBefore(rangeEnd.add(1, 'day'))
        );
      })
      .reduce((sum, a) => sum + parseInt(a.achieved || 0), 0);

    const totalDays = rangeEnd.diff(rangeStart, 'day') + 1;
    return {
      ...task,
      achieved: achievementSum,
      target: task.target * totalDays
    };
  });

  const getTaskDescription = (taskId) => {
    const task = tasks.find(t => t.id === parseInt(taskId));
    return task ? task.description : 'N/A';
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Employee Detail</Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Personal Info</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}><b>Name:</b> {user.first_name} {user.last_name}</Grid>
          <Grid item xs={6}><b>Username:</b> {user.user_name}</Grid>
          <Grid item xs={6}><b>Position:</b> {user.position}</Grid>
          <Grid item xs={6}><b>Department:</b> {user.department}</Grid>
          <Grid item xs={6}><b>Account Type:</b> {user.account_type}</Grid>
        </Grid>
      </Paper>

      {/* Filter by Day */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Filter by Day</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={newDate => setSelectedDate(newDate)}
            renderInput={(params) => <TextField {...params} sx={{ mt: 2 }} />}
          />
        </LocalizationProvider>

        <Typography variant="subtitle1" sx={{ mt: 3 }}>
          Achievements on {formatDate(selectedDate)}:
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Description</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Achieved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAchievementsByDay.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{getTaskDescription(task.taskId)}</TableCell>
                <TableCell>{task.target}</TableCell>
                <TableCell>{task.achieved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Filter by Date Range */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6">Filter by Date Range</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box display="flex" gap={2} mt={2}>
            <DatePicker
              label="From"
              value={rangeStart}
              onChange={setRangeStart}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="To"
              value={rangeEnd}
              onChange={setRangeEnd}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </LocalizationProvider>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Achievements from {formatDate(rangeStart)} to {formatDate(rangeEnd)}:
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Description</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Achieved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAchievementsByRange.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{getTaskDescription(task.taskId)}</TableCell>
                <TableCell>{task.target}</TableCell>
                <TableCell>{task.achieved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default EmployeeDetail;

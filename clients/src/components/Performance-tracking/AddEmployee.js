import React, { useState } from 'react';
import axios from 'axios';

import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Box
} from '@mui/material';

const departmentOptions = [
  'ICT Department',
  'Finance',
  'Human Resource',
  'Transport Management',
  'Demand',
  'EWM'
];

const jobTitleOptions = [
  'Warehouse Manager',
  'Finance Officer',
  'ICT Officer',
  'HR Officer'
];

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    fullName: '',
    jobTitle: '',
    department: ''
  });
  
  const api_url = process.env.REACT_APP_API_URL;

  const handleChange = (field, value) => {
    setEmployee((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
      //e.preventDefault();
    try {
      const result = await axios.post(`${api_url}/api/addEmployee`, employee);
      alert(result.data.message);
      window.location.reload();
    } catch (e) {
      console.log(`the error is ${e}`);
    }
    

    console.log('Employee submitted:', employee);

    // Reset the form
    setEmployee({
      fullName: '',
      jobTitle: '',
      department: ''
    });
  };


  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Employee
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Full Name"
          value={employee.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          fullWidth
          label="Job Title"
          value={employee.jobTitle}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          sx={{ mb: 2 }}
        >
          {jobTitleOptions.map((title, idx) => (
            <MenuItem key={idx} value={title}>
              {title}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          label="Department"
          value={employee.department}
          onChange={(e) => handleChange('department', e.target.value)}
          sx={{ mb: 2 }}
        >
          {departmentOptions.map((dept, idx) => (
            <MenuItem key={idx} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>

        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddEmployee;

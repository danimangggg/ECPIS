import React, { useState } from 'react';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Box, Typography, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateUserForm = () => {
  const api_url = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    password: '',
    account_type: '',
  });

  const accountTypes = ['Admin', 'Credit Manager', 'Pod Manager', 'Self '];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(`${api_url}/api/addUser`, formData);
      alert(result.data.message);
      window.location.reload();
    } catch (e) {
      console.log(`the error is ${e}`);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ backgroundColor: '#f0f0f0', padding: 2 }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '400px', borderRadius: 2, position: 'relative' }}>
        <IconButton
          onClick={handleBack}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom align="center">
          Create User
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
        >
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Username"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            margin="normal"
            fullWidth
            autoComplete="off" // Prevents the browser from suggesting saved usernames
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            fullWidth
            autoComplete="new-password" // Prevents the browser from suggesting saved passwords
          />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Account Type</InputLabel>
            <Select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
            >
              {accountTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            Create User
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateUserForm;

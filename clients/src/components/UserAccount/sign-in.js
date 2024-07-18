
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const defaultTheme = createTheme();

export default function SignIn() {

  const [user_name, setuserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const formValidation = () =>{

    let isvalid = true
    if(!user_name){
      toast.warn("user name is required")
      isvalid = false
    }
    if(!password){
      toast.warn("password is required")
      isvalid = false
    }
    return isvalid
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api_url = process.env.REACT_APP_API_URL;
    try {
      if(formValidation()){
      const response = await axios.post(`${api_url}/api/login`, { user_name, password });
      const { token } = response.data;

      // Save the token in localStorage (or cookie)
      localStorage.setItem('token', token);
      localStorage.setItem("FullName", response.data.FullName)

      // Redirect to a protected route
      navigate('/viewContract'); 
      }
    } catch (err) {
        toast.error('Invalid email or password.');
    }
};

  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="User Name"
              name="email"
              autoFocus
              value={user_name}
              onChange={(e) => setuserName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <ToastContainer />
          </Box>
        </Box>
      </Container>
  );
}
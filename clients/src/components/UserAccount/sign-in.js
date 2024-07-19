import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

const defaultTheme = createTheme();

export default function SignIn() {
  const [user_name, setuserName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const formValidation = () => {
    let isvalid = true;
    if (!user_name) {
      toast.warn("user name is required");
      isvalid = false;
    }
    if (!password) {
      toast.warn("password is required");
      isvalid = false;
    }
    return isvalid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const api_url = process.env.REACT_APP_API_URL;
    try {
      if (formValidation()) {
        const response = await axios.post(`${api_url}/api/login`, { user_name, password });
        const { token } = response.data;

        // Save the token in localStorage (or cookie)
        localStorage.setItem('token', token);
        localStorage.setItem("FullName", response.data.FullName);

        // Redirect to a protected route
        navigate('/viewContract');
      }
    } catch (err) {
      toast.error('Invalid email or password.');
    }
  };

  const guest = () => {
    localStorage.setItem("FullName", 'Guest');
    localStorage.setItem('token', 'guest');
    navigate('/viewContract');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(/pharmaceuticals.jpg)', // Reference to the image in the public folder
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
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
                style={{
                  borderRadius: 35,
                  backgroundColor: "blue",
                  padding: "10px 20px",
                  fontSize: "18px"
                }}
              >
                Sign In
              </Button>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={guest}
                style={{
                  borderRadius: 35,
                  backgroundColor: "#21b6ae",
                  padding: "10px 20px",
                  fontSize: "15px"
                }}
              >
                Guest mode
              </Button>
              <ToastContainer />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

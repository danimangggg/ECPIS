import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { styled } from '@mui/material/styles';

// Styled Feature Card
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[6],
  },
}));

const LandingPage = () => {
  const user = (localStorage.getItem('FullName')) || { name: 'Guest' };

  return (
    <div>
      {/* AppBar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <AssessmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Self-Assessment App
          </Typography>
          <Button color="inherit" href="#features">
            Features
          </Button>
          <Button color="inherit" href="#get-started">
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(to right, #2196f3, #21cbf3)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome, {user}!
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Unlock your potential with our Self-Assessment App.
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="#get-started"
            sx={{
              backgroundColor: 'white',
              color: '#2196f3',
              '&:hover': { backgroundColor: '#f0f0f0' },
              fontWeight: 'bold',
              borderRadius: '50px',
              px: 4,
              py: 1.5,
            }}
          >
            Start Your Assessment
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 6 }}>
          Our app empowers you to assess yourself in a simple, effective, and insightful way.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <FeatureCard elevation={3}>
              <Typography variant="h6" gutterBottom>
                Easy Self-Assessment
              </Typography>
              <Typography>
                Simple, intuitive questions designed to help you reflect and evaluate effectively.
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FeatureCard elevation={3}>
              <Typography variant="h6" gutterBottom>
                Visual Progress
              </Typography>
              <Typography>
                Track your growth and visualize achievements through beautiful charts and reports.
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FeatureCard elevation={3}>
              <Typography variant="h6" gutterBottom>
                Personalized Insights
              </Typography>
              <Typography>
                Get customized tips and learning resources based on your assessment results.
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      
    </div>
  );
};

export default LandingPage;

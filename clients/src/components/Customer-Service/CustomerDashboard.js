import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  useTheme,
  Chip,
  Fade,
  Slide,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// A complete and self-contained React component for a customer service dashboard.
const CustomerServiceDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyCompletedData, setDailyCompletedData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [dailyRegistrationTrend, setDailyRegistrationTrend] = useState([]);
  const theme = useTheme();
  
  // Define colors for charts based on the vibrant theme
  const chartColors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main];
  
  // FIX: Use a fallback URL if the environment variable is not defined.
  // Replace 'https://your-api-url.com' with your actual API endpoint.
  const api_url = process.env.REACT_APP_API_URL || 'https://your-api-url.com';
  
  // Function to process raw customer data into daily completed tasks
  const processDailyCompletedData = useCallback((customerData) => {
    const dailyCounts = customerData.reduce((acc, customer) => {
      if (customer.status?.toLowerCase() === 'completed' && customer.completed_at) {
        const date = dayjs(customer.completed_at).format('MMM DD');
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});
    const processedData = Object.keys(dailyCounts).map(date => ({
      date,
      'Completed Tasks': dailyCounts[date],
    })).sort((a, b) => dayjs(a.date, 'MMM DD').isAfter(dayjs(b.date, 'MMM DD')) ? 1 : -1);
    setDailyCompletedData(processedData);
  }, []);

  // Function to process data into a status distribution for the pie chart
  const processStatusDistribution = useCallback((customerData) => {
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    
    customerData.forEach(customer => {
      const waitingHours = dayjs().diff(dayjs(customer.started_at), 'hour');
      const isCompleted = customer.status?.toLowerCase() === 'completed';

      if (isCompleted) {
        completed++;
      } else if (waitingHours > 24) {
        overdue++;
      } else {
        inProgress++;
      }
    });

    const data = [
      { name: 'Completed', value: completed, color: theme.palette.success.main },
      { name: 'In Progress', value: inProgress, color: theme.palette.warning.main },
      { name: 'Overdue', value: overdue, color: theme.palette.error.main },
    ];
    setStatusDistribution(data);
  }, [theme]);

  // Function to process data for the daily registration trend line chart
  const processDailyRegistrationTrend = useCallback((customerData) => {
    const dailyCounts = customerData.reduce((acc, customer) => {
      const date = dayjs(customer.started_at).format('MMM DD');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const processedData = Object.keys(dailyCounts).map(date => ({
      date,
      'New Registrations': dailyCounts[date],
    })).sort((a, b) => dayjs(a.date, 'MMM DD').isAfter(dayjs(b.date, 'MMM DD')) ? 1 : -1);
    setDailyRegistrationTrend(processedData);
  }, []);


  // Main effect to fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [customerRes, facilityRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`)
        ]);
        const fetchedCustomers = customerRes.data;
        const fetchedFacilities = facilityRes.data;
        setCustomers(fetchedCustomers);
        setFacilities(fetchedFacilities);
        
        // Process data for charts
        processDailyCompletedData(fetchedCustomers);
        processStatusDistribution(fetchedCustomers);
        processDailyRegistrationTrend(fetchedCustomers);

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [api_url, processDailyCompletedData, processStatusDistribution, processDailyRegistrationTrend]);

  // Calculate key metrics
  const totalCustomers = customers.length;
  const completedCustomers = customers.filter(c => c.status?.toLowerCase() === 'completed').length;
  const allWaitingTimes = customers.filter(c => c.completed_at).map(c => dayjs(c.completed_at).diff(dayjs(c.started_at), 'hour'));
  const averageWaitingTime = allWaitingTimes.length > 0 ? (allWaitingTimes.reduce((sum, time) => sum + time, 0) / allWaitingTimes.length).toFixed(2) : 'N/A';

  // Helper function to render custom tooltip for charts
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((p, index) => (
            <Typography key={index} variant="body2" sx={{ color: p.color }}>
              {p.name}: {p.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };
  
  // Custom legend for the Pie Chart
  const renderPieLegend = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 2 }}>
      {statusDistribution.map((entry, index) => (
        <Chip
          key={`legend-${index}`}
          label={`${entry.name}: ${entry.value}`}
          sx={{
            bgcolor: entry.color,
            color: theme.palette.getContrastText(entry.color),
            mb: 0.5,
            fontWeight: 'bold',
            '& .MuiChip-label': {
              pl: 1,
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={500}>
      <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: `2px solid ${theme.palette.primary.light}`,
        }}>
          <TrendingUpIcon color="primary" sx={{ fontSize: 50, mr: 2 }} />
          <Typography variant="h4" color="text.primary">
            Customer Service Dashboard
          </Typography>
        </Box>

        {loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, py: 6, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CircularProgress size={70} thickness={5} color="primary" />
            </Box>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            {/* Summary Cards */}
            <Grid item xs={12} sm={4}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                <Typography variant="h6" fontWeight="bold">Total Customers</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h3" fontWeight="bold">{totalCustomers}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.success.light, color: theme.palette.success.dark }}>
                <Typography variant="h6" fontWeight="bold">Tasks Completed</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h3" fontWeight="bold">{completedCustomers}</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.dark }}>
                <Typography variant="h6" fontWeight="bold">Avg. Waiting Time</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h3" fontWeight="bold">{averageWaitingTime}</Typography>
                  <Typography variant="h6" sx={{ ml: 1 }}>hrs</Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Daily Completed Tasks Bar Chart */}
            <Grid item xs={12} md={8}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, minHeight: 400 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Daily Completed Tasks</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyCompletedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip content={renderTooltip} />
                    <Legend />
                    <Bar dataKey="Completed Tasks" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Status Distribution Pie Chart */}
            <Grid item xs={12} md={4}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Task Status Distribution</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      fill="#8884d8"
                      labelLine={false}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                {renderPieLegend()}
              </Paper>
            </Grid>

            {/* Daily Registration Trend Line Chart */}
            <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, minHeight: 350 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Daily Registration Trend</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyRegistrationTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip content={renderTooltip} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="New Registrations"
                      stroke={theme.palette.secondary.main}
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

          </Grid>
        )}
      </Box>
    </Slide>
  );
};

export default CustomerServiceDashboard;

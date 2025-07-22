import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));

  const api_url = process.env.REACT_APP_API_URL;

  // Fetch customers and facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, facRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`)
        ]);
        setCustomers(custRes.data);
        setFacilities(facRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [api_url]);

  // Advance slide every 6s
  useEffect(() => {
    if (customers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % customers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [customers]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: get facility by id
  const getFacility = (id) => facilities.find((f) => f.id === id);

  // Helper: format waiting time as "X hr Y min"
  const calculateWaitingTime = (startedAt) => {
    if (!startedAt) return 'N/A';
    const start = dayjs(startedAt);
    const diffMins = dayjs().diff(start, 'minute');
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours} hr ${minutes} min`;
  };

  // Filter only customers with status 'started' (which means 'In Progress')
  const inProgressCustomers = customers.filter(cust => cust.status?.toLowerCase() === 'started');

  // The customer to show on screen now
  const currentCustomer = inProgressCustomers.length > 0 ? inProgressCustomers[currentIndex % inProgressCustomers.length] : null;

  if (loading) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  if (!currentCustomer) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h3" sx={{ mb: 2, color: '#0ff' }}>
          Live Customer Registration — In Progress
        </Typography>
        <Typography variant="h5">No customers currently in progress</Typography>
      </Box>
    );
  }

  const facility = getFacility(currentCustomer.facility_id);

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#000',
        color: '#fff',
        p: 4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Clock */}
      <Typography
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#0ff',
        }}
      >
        {currentTime}
      </Typography>

      {/* Title */}
      <Typography variant="h3" sx={{ mb: 5, fontWeight: 'bold', color: '#0ff' }}>
        Live Customer Progress Follow-up
      </Typography>

      {/* Animated slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCustomer.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundColor: '#111',
            borderRadius: 16,
            padding: '3rem 4rem',
            width: '70vw',
            maxWidth: '900px',
            boxShadow: '0 0 30px #0ff',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, color: '#0ff' }}>
             Facility: {facility?.facility_name || 'N/A'}
          </Typography>

          <Typography variant="h5" sx={{ mb: 2 }}>
            Delegate: {currentCustomer?.delegate || 'N/A'}
          </Typography>

          <Typography variant="h5" sx={{ mb: 2 }}>
            Service Point: {currentCustomer.next_service_point || 'N/A'}
          </Typography>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Waiting Time: {calculateWaitingTime(currentCustomer.started_at)}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Status: In Progress
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CustomerRegistrationList;

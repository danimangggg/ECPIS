import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));

  const api_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, facRes, empRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`),
          axios.get(`${api_url}/api/get-employee`)
        ]);
        setCustomers(custRes.data);
        setFacilities(facRes.data);
        setEmployees(empRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [api_url]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFacility = (id) => facilities.find((f) => f.id === id);
  const getOfficerName = (officerId) => {
    const user = employees.find(u => u.id === officerId);
    return user ? user.full_name : 'N/A';
  };

  const today = dayjs().startOf('day');
  const filteredCustomers = customers
    .filter(cust =>
      cust.status?.toLowerCase() === 'started' &&
      cust.next_service_point?.toLowerCase() === 'o2c' &&
      dayjs(cust.started_at).isAfter(today)
    )
    .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

  if (loading) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#141E30',
        color: '#fff',
        p: 4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00e5ff',
        }}
      >
        {currentTime}
      </Typography>

      <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', color: '#00e5ff' }}>
        Live Customer Progress Follow-up
      </Typography>

      {filteredCustomers.length === 0 ? (
        <Typography variant="h5" sx={{ mt: 10 }}>
          No customers at O2C service point currently in progress.
        </Typography>
      ) : (
        <Box
          sx={{
            height: '75vh',
            width: '90vw',
            maxWidth: 1300,
            position: 'relative',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 3,
            p: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            className="scroll-wrapper"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              animation: `slideUp ${filteredCustomers.length * 6}s linear infinite`,
            }}
          >
            {[...filteredCustomers, ...filteredCustomers].map((cust, index) => {
              const facility = getFacility(cust.facility_id);
              return (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: 3,
                    padding: 2,
                    boxShadow: '0 0 15px #00e5ff',
                    minHeight: 100,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 4,
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#00e5ff', width: '10%' }}>
                    #{(index % filteredCustomers.length) + 1}
                  </Typography>
                  <Typography variant="h6" sx={{ width: '30%' }}>
                    Facility: {facility?.facility_name || 'N/A'}
                  </Typography>
                  <Typography variant="h6" sx={{ width: '40%' }}>
                    Assigned Officer: {getOfficerName(cust.assigned_officer_id)}
                  </Typography>
                  <Typography variant="h6" sx={{ width: '20%', color: '#76ff03' }}>
                    Status: In Progress
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      <style>
        {`
          @keyframes slideUp {
            0% {
              transform: translateY(0%);
            }
            100% {
              transform: translateY(-50%);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CustomerRegistrationList;

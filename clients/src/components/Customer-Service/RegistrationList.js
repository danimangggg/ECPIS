import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const api_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [customerRes, facilityRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`)
        ]);

        setCustomers(customerRes.data);
        setFacilities(facilityRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Data fetch error:', err);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getFacility = (id) => facilities.find(f => f.id === id);

  const calculateWaitingHours = (startedAt) => {
    const now = dayjs();
    const start = dayjs(startedAt);
    const diffMinutes = now.diff(start, 'minute');
    return (diffMinutes / 60).toFixed(2);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Registered Customers
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Facility</strong></TableCell>
                <TableCell><strong>Woreda</strong></TableCell>
                <TableCell><strong>Zone</strong></TableCell>
                <TableCell><strong>Region</strong></TableCell>
                <TableCell><strong>Customer Type</strong></TableCell>
                <TableCell><strong>Arrived Time</strong></TableCell>
                <TableCell><strong>Waiting (hrs)</strong></TableCell>
                <TableCell><strong>Current Service Point</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((cust, i) => {
                const facility = getFacility(cust.facility_id);
                return (
                  <TableRow key={i}>
                    <TableCell>{facility?.facility_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.woreda_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.zone_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.region_name || 'N/A'}</TableCell>
                    <TableCell>{cust.customer_type}</TableCell>
                    <TableCell>{dayjs(cust.started_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>{calculateWaitingHours(cust.started_at)}</TableCell>
                    <TableCell>{cust.next_service_point || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CustomerRegistrationList;

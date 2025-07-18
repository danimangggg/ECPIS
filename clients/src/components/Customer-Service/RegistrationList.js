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

  // Fetch customer registrations and facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, facilityRes] = await Promise.all([
          axios.get('/api/customer-queue'),
          axios.get('/api/facilities')
        ]);

        setCustomers(customerRes.data);
        setFacilities(facilityRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFacilityInfo = (facilityId, field) => {
    const facility = facilities.find(f => f.id === facilityId);
    return facility ? facility[field] : 'N/A';
  };

  const calculateWaitingHours = (startedAt) => {
    const now = dayjs();
    const start = dayjs(startedAt);
    return now.diff(start, 'hour', true).toFixed(2);
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
                <TableCell><strong>Arrived Date & Time</strong></TableCell>
                <TableCell><strong>Waiting Time (hrs)</strong></TableCell>
                <TableCell><strong>Current Service Point</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((cust, index) => (
                <TableRow key={index}>
                  <TableCell>{getFacilityInfo(cust.facility_id, 'facility_name')}</TableCell>
                  <TableCell>{getFacilityInfo(cust.facility_id, 'woreda')}</TableCell>
                  <TableCell>{getFacilityInfo(cust.facility_id, 'zone')}</TableCell>
                  <TableCell>{getFacilityInfo(cust.facility_id, 'region')}</TableCell>
                  <TableCell>{cust.customer_type}</TableCell>
                  <TableCell>{dayjs(cust.started_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{calculateWaitingHours(cust.started_at)}</TableCell>
                  <TableCell>{cust.next_service_point}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CustomerRegistrationList;

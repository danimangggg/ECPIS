import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const api_url = process.env.REACT_APP_API_URL;

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${api_url}/api/customer-queue`)
      .then(res => {
        setCustomers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch customers:", err);
        setLoading(false);
      });
  }, []);

  const calculateWaitingHours = (startedAt) => {
    const now = dayjs();
    const start = dayjs(startedAt);
    return now.diff(start, 'hour', true).toFixed(2);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Registered Customer List
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Facility</strong></TableCell>
                <TableCell><strong>Woreda</strong></TableCell>
                <TableCell><strong>Zone</strong></TableCell>
                <TableCell><strong>Region</strong></TableCell>
                <TableCell><strong>Customer Type</strong></TableCell>
                <TableCell><strong>Arrived At</strong></TableCell>
                <TableCell><strong>Waiting (hrs)</strong></TableCell>
                <TableCell><strong>Current Service Point</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((cust, idx) => (
                <TableRow key={idx}>
                  <TableCell>{cust.facility?.facility_name || 'N/A'}</TableCell>
                  <TableCell>{cust.facility?.woreda_name || 'N/A'}</TableCell>
                  <TableCell>{cust.facility?.zone_name || 'N/A'}</TableCell>
                  <TableCell>{cust.facility?.region_name || 'N/A'}</TableCell>
                  <TableCell>{cust.customer_type}</TableCell>
                  <TableCell>{dayjs(cust.started_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{calculateWaitingHours(cust.started_at)}</TableCell>
                  <TableCell>{cust.current_service_point}</TableCell>
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

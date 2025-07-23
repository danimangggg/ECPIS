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
  TablePagination,
  Button,
  TableSortLabel,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 30;

  const [orderBy, setOrderBy] = useState('facility');
  const [order, setOrder] = useState('asc');

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
  }, [api_url]);

  const getFacility = (id) => facilities.find(f => f.id === id);

  const calculateWaitingHours = (startedAt, completedAt, status) => {
    const start = dayjs(startedAt);
    const end = (status?.toLowerCase() === 'completed' && completedAt) ? dayjs(completedAt) : dayjs();
    const diffMinutes = end.diff(start, 'minute');
    return diffMinutes / 60;
  };

  const formatWaitingTime = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hr ${minutes} min`;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    const fa = getFacility(a.facility_id);
    const fb = getFacility(b.facility_id);

    const getValue = (cust, key) => {
      switch (key) {
        case 'facility':
          return getFacility(cust.facility_id)?.facility_name || '';
        case 'woreda':
          return getFacility(cust.facility_id)?.woreda_name || '';
        case 'zone':
          return getFacility(cust.facility_id)?.zone_name || '';
        case 'region':
          return getFacility(cust.facility_id)?.region_name || '';
        case 'customer_type':
          return cust.customer_type || '';
        case 'waiting_hours':
          return calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
        case 'next_service_point':
          return cust.next_service_point || '';
        case 'status':
          return cust.status?.toLowerCase() === 'started' ? 'in progress' : (cust.status || '');
        default:
          return '';
      }
    };

    const aVal = getValue(a, orderBy);
    const bVal = getValue(b, orderBy);

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
      return order === 'asc'
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    }
  });

  const paginatedCustomers = sortedCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportToExcel = () => {
    const data = customers.map((cust) => {
      const facility = getFacility(cust.facility_id);
      const waitingHours = calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
      return {
        Facility: facility?.facility_name || 'N/A',
        Woreda: facility?.woreda_name || 'N/A',
        Zone: facility?.zone_name || 'N/A',
        Region: facility?.region_name || 'N/A',
        CustomerType: cust.customer_type,
        CompletedAt: cust.completed_at || '',
        Waiting: formatWaitingTime(waitingHours),
        ServicePoint: cust.next_service_point || 'N/A',
        ProcessStatus: cust.status?.toLowerCase() === 'started' ? 'In Progress' : cust.status,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "Customer_Registration_List.xlsx");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Registered Customers
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" color="primary" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { id: 'facility', label: 'Facility' },
                  { id: 'woreda', label: 'Woreda' },
                  { id: 'zone', label: 'Zone' },
                  { id: 'region', label: 'Region' },
                  { id: 'customer_type', label: 'Customer Type' },
                  { id: 'waiting_hours', label: 'Waiting' }, // Label changed
                  { id: 'next_service_point', label: 'Current Service Point' },
                  { id: 'status', label: 'Process Status' },
                ].map((headCell) => (
                  <TableCell key={headCell.id}>
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCustomers.map((cust, i) => {
                const facility = getFacility(cust.facility_id);
                const waitingHours = calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
                const isCompleted = cust.status?.toLowerCase() === 'completed';

                return (
                  <TableRow
                    key={i}
                    sx={{
                      backgroundColor: isCompleted
                        ? '#d0f0c0'
                        : waitingHours > 24
                        ? '#f8d7da'
                        : 'inherit',
                    }}
                  >
                    <TableCell>{facility?.facility_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.woreda_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.zone_name || 'N/A'}</TableCell>
                    <TableCell>{facility?.region_name || 'N/A'}</TableCell>
                    <TableCell>{cust.customer_type}</TableCell>
                    <TableCell>{formatWaitingTime(waitingHours)}</TableCell>
                    <TableCell>{cust.next_service_point || 'N/A'}</TableCell>
                    <TableCell>{cust.status?.toLowerCase() === 'started' ? 'In Progress' : cust.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={customers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default CustomerRegistrationList;

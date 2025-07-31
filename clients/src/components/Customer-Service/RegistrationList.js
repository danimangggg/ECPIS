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
  Chip,
  Fade,
  Slide, // ADDED: For more dynamic entry
  Zoom, // ADDED: For a subtle zoom effect on cards
  useTheme,
  alpha, // <-- ADDED: Import alpha utility for color manipulation
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import PeopleIcon from '@mui/icons-material/People';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // More specific icon for export

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 30;

  const [orderBy, setOrderBy] = useState('facility');
  const [order, setOrder] = useState('asc');

  const theme = useTheme();

  const api_url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [customerRes, facilityRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`)
        ]);
        setCustomers(customerRes.data);
        setFacilities(facilityRes.data);
      } catch (err) {
        console.error('Data fetch error:', err);
        // Consider setting an error message for the user here
      } finally {
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
    if (isNaN(decimalHours) || decimalHours < 0) return 'N/A';
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
    const getValue = (cust, key) => {
      const facility = getFacility(cust.facility_id);
      switch (key) {
        case 'facility':
          return facility?.facility_name || '';
        case 'woreda':
          return facility?.woreda_name || '';
        case 'zone':
          return facility?.zone_name || '';
        case 'region':
          return facility?.region_name || '';
        case 'customer_type':
          return cust.customer_type || '';
        case 'waiting_hours':
          return calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
        case 'next_service_point':
          return cust.next_service_point || '';
        case 'status':
          return cust.status?.toLowerCase() === 'started' ? 'in progress' : (cust.status?.toLowerCase() || '');
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
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
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
        ProcessStatus: cust.status?.toLowerCase() === 'started' ? 'In Progress' : (cust.status || 'N/A'),
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "Customer_Registration_List.xlsx");
  };

  return (
    // Slide in the entire page content
    <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={500}>
      <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4, // More space below header
          pb: 2, // Padding at bottom of header box
          borderBottom: `2px solid ${alpha(theme.palette.primary.light, 0.4)}`, // A vibrant underline
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> {/* Increased gap */}
            <PeopleIcon color="primary" sx={{ fontSize: 50 }} /> {/* Larger icon */}
            <Typography variant="h4" color="text.primary">
              Registered Customers
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToExcel}
            startIcon={<FileDownloadIcon />} 
            sx={{
              px: 4, // More horizontal padding
              py: 1.5, // More vertical padding
              boxShadow: theme.shadows[6], // Stronger default shadow
              '&:hover': {
                boxShadow: theme.shadows[10], // Even stronger on hover
                transform: 'translateY(-3px) scale(1.02)', // More pronounced lift and slight scale
                transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out', // Smoother transition
              },
            }}
          >
            Export to Excel
          </Button>
        </Box>

        {loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, py: 6, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CircularProgress size={70} thickness={5} color="primary" />
            </Box>
          </Fade>
        ) : (
          <Zoom in={!loading} timeout={600}>
            <TableContainer component={Paper} elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Table stickyHeader aria-label="customer registration table">
                <TableHead>
                  <TableRow>
                    {[
                      { id: 'facility', label: 'Facility' },
                      { id: 'woreda', label: 'Woreda' },
                      { id: 'zone', label: 'Zone' },
                      { id: 'region', label: 'Region' },
                      { id: 'customer_type', label: 'Customer Type' },
                      { id: 'waiting_hours', label: 'Waiting Time', align: 'right' },
                      { id: 'next_service_point', label: 'Current Service Point' },
                      { id: 'status', label: 'Process Status' },
                    ].map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                          sx={{ '&.Mui-active': { color: theme.palette.primary.main } }}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 5, color: theme.palette.text.secondary }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>No customer registrations found.</Typography>
                        <Typography variant="body2">Try refreshing or check your filters.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((cust, i) => {
                      const facility = getFacility(cust.facility_id);
                      const waitingHours = calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
                      const isCompleted = cust.status?.toLowerCase() === 'completed';
                      const isInProgress = cust.status?.toLowerCase() === 'started';
                      const isOverdue = waitingHours > 24 && !isCompleted;

                      let statusChipColor = 'default';
                      let statusChipVariant = 'outlined';
                      if (isCompleted) {
                        statusChipColor = 'success';
                        statusChipVariant = 'filled';
                      } else if (isInProgress) {
                        statusChipColor = 'warning';
                        statusChipVariant = 'outlined';
                      } else if (isOverdue) {
                        statusChipColor = 'error';
                        statusChipVariant = 'filled';
                      } else {
                        statusChipColor = 'info';
                      }


                      return (
                        <TableRow
                          key={i}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            },
                            '&:nth-of-type(even)': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.light, 0.1) + ' !important',
                              transform: 'scale(1.005)',
                              transition: 'transform 0.15s ease-out, background-color 0.15s ease-out',
                            },
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <TableCell>{facility?.facility_name || 'N/A'}</TableCell>
                          <TableCell>{facility?.woreda_name || 'N/A'}</TableCell>
                          <TableCell>{facility?.zone_name || 'N/A'}</TableCell>
                          <TableCell>{facility?.region_name || 'N/A'}</TableCell>
                          <TableCell>{cust.customer_type || 'N/A'}</TableCell>
                          <TableCell align="right">{formatWaitingTime(waitingHours)}</TableCell>
                          <TableCell>{cust.next_service_point || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={isInProgress ? 'IN PROGRESS' : (cust.status || 'N/A').toUpperCase()}
                              size="small"
                              color={statusChipColor}
                              variant={statusChipVariant}
                              sx={{ minWidth: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={customers.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}
              />
            </TableContainer>
          </Zoom>
        )}
      </Box>
    </Slide>
  );
};

export default CustomerRegistrationList;
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
  Slide,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as XLSX from 'xlsx';
import PeopleIcon from '@mui/icons-material/People';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Extend dayjs with the necessary plugins
dayjs.extend(utc);
dayjs.extend(customParseFormat);

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 30;

  const [orderBy, setOrderBy] = useState('registered_date');
  const [order, setOrder] = useState('desc');

  const theme = useTheme();

  // The environment variable for the API URL
  const api_url = process.env.REACT_APP_API_URL;

  // Fetch data from the APIs on component mount
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
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [api_url]);

  // Helper function to find a facility by its ID
  const getFacility = (id) => facilities.find(f => f.id === id);

  // Calculates the waiting time in hours
  const calculateWaitingHours = (startedAt, completedAt, status) => {
    // Parse the date as UTC to ensure correct time zone handling
    const start = dayjs.utc(startedAt);
    const end = (status?.toLowerCase() === 'completed' && completedAt) ? dayjs.utc(completedAt) : dayjs.utc();
    const diffMinutes = end.diff(start, 'minute');
    return diffMinutes / 60;
  };

  // Formats the waiting time into a readable string
  const formatWaitingTime = (decimalHours) => {
    if (isNaN(decimalHours) || decimalHours < 0) return 'N/A';
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} hr ${minutes} min`;
  };

  // Handles column sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Formats the date using the Gregorian calendar
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    // Correctly parse the UTC date string from the API
    const gregorianDate = dayjs.utc(dateString);

    if (!gregorianDate.isValid()) {
      return 'N/A';
    }

    // Convert the UTC time to the user's local time for display
    const localDate = gregorianDate.local();

    return localDate.format('YYYY-MM-DD hh:mm A');
  };

  // Sort customers based on the selected column and order
  const sortedCustomers = [...customers].sort((a, b) => {
    const getValue = (cust, key) => {
      const facility = getFacility(cust.facility_id);
      switch (key) {
        case 'facility':
          return facility?.facility_name || '';
        case 'woreda':
          return facility?.woreda_name || '';
        case 'customer_type':
          return cust.customer_type || '';
        case 'waiting_hours':
          return calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
        case 'next_service_point':
          return cust.next_service_point || '';
        case 'status':
          return cust.status?.toLowerCase() === 'started' ? 'in progress' : (cust.status?.toLowerCase() || '');
        case 'registered_date':
            return dayjs.utc(cust.started_at).unix();
        case 'delegate':
            return cust.delegate || '';
        case 'delegate_phone':
            return cust.delegate_phone || '';
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

  // Paginate the sorted customers
  const paginatedCustomers = sortedCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Function to export table data to an Excel file
  const exportToExcel = () => {
    const data = customers.map((cust) => {
      const facility = getFacility(cust.facility_id);
      const waitingHours = calculateWaitingHours(cust.started_at, cust.completed_at, cust.status);
      return {
        Facility: facility?.facility_name || 'N/A',
        Woreda: facility?.woreda_name || 'N/A',
        CustomerType: cust.customer_type,
        'Registered Date': formatDate(cust.started_at),
        'Delegate Person': cust.delegate || 'N/A',
        'Delegate Phone': cust.delegate_phone || 'N/A',
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

  // Define table columns with shortened labels for a cleaner look
  const columns = [
    { id: 'facility', label: 'Facility' },
    { id: 'woreda', label: 'Woreda' },
    { id: 'registered_date', label: 'Reg. Date' },
    { id: 'delegate', label: 'Delegate' },
    { id: 'delegate_phone', label: 'Delegate Phone' },
    { id: 'customer_type', label: 'Type' },
    { id: 'waiting_hours', label: 'Wait Time', align: 'right' },
    { id: 'next_service_point', label: 'Service Point' },
    { id: 'status', label: 'Status' },
  ];
  
  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={500}>
      <Box sx={{ p: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          pb: 2,
          borderBottom: `2px solid ${alpha(theme.palette.primary.light, 0.4)}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PeopleIcon color="primary" sx={{ fontSize: 50 }} />
            <Typography variant="h4" color="text.primary">
              Registered Customers
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcel}
              startIcon={<FileDownloadIcon />}
              sx={{
                px: 4,
                py: 1.5,
                boxShadow: theme.shadows[6],
                '&:hover': {
                  boxShadow: theme.shadows[10],
                  transform: 'translateY(-3px) scale(1.02)',
                  transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
                },
              }}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Fade in={loading}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, py: 6, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CircularProgress size={70} thickness={5} color="primary" />
            </Box>
          </Fade>
        ) : (
          <Zoom in={!loading} timeout={600}>
            <TableContainer component={Paper} elevation={8} sx={{ borderRadius: 3, overflowX: 'auto' }}>
              <Table
                stickyHeader
                aria-label="customer registration table"
              >
                <TableHead>
                  <TableRow>
                    {columns.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                          fontSize: '0.8rem',
                          // Prevent word wrapping for a cleaner header
                          whiteSpace: 'nowrap',
                          fontWeight: 'bold',
                          // Set a minimum width for important columns to prevent squishing
                          minWidth: 
                            headCell.id === 'delegate' ? '120px' :
                            headCell.id === 'delegate_phone' ? '120px' :
                            headCell.id === 'status' ? '150px' : '100px',
                        }}
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
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5, color: theme.palette.text.secondary }}>
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
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              align={column.align || 'left'}
                              sx={{
                                fontSize: '0.8rem',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                minWidth: 
                                  column.id === 'delegate' ? '120px' :
                                  column.id === 'delegate_phone' ? '120px' :
                                  column.id === 'status' ? '150px' : '100px',
                              }}
                            >
                              {column.id === 'facility' && (facility?.facility_name || 'N/A')}
                              {column.id === 'woreda' && (facility?.woreda_name || 'N/A')}
                              {column.id === 'registered_date' && formatDate(cust.started_at)}
                              {column.id === 'delegate' && (cust.delegate || 'N/A')}
                              {column.id === 'delegate_phone' && (cust.delegate_phone || 'N/A')}
                              {column.id === 'customer_type' && (cust.customer_type || 'N/A')}
                              {column.id === 'waiting_hours' && formatWaitingTime(waitingHours)}
                              {column.id === 'next_service_point' && (cust.next_service_point || 'N/A')}
                              {column.id === 'status' && (
                                <Chip
                                  label={isInProgress ? 'IN PROGRESS' : (cust.status || 'N/A').toUpperCase()}
                                  size="small"
                                  color={statusChipColor}
                                  variant={statusChipVariant}
                                  sx={{
                                    whiteSpace: 'normal',
                                    height: 'auto',
                                    '& .MuiChip-label': {
                                      fontSize: '0.6rem',
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                    }
                                  }}
                                />
                              )}
                            </TableCell>
                          ))}
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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, CircularProgress, Box
} from '@mui/material';

const OutstandingCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const jobTitle = localStorage.getItem("JobTitle");
  const userId = localStorage.getItem("UserId");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customerRes, facilityRes, employeeRes] = await Promise.all([
        axios.get('http://localhost:3001/api/serviceList'),
        axios.get('http://localhost:3001/api/facilities'),
        axios.get('http://localhost:3001/api/get-employee'),
      ]);
      setCustomers(customerRes.data);
      setFacilities(facilityRes.data);
      setEmployees(employeeRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFacilityDetails = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return {
      name: facility?.facility_name || 'N/A',
      woreda: facility?.woreda_name || 'N/A',
      zone: facility?.zone_name || 'N/A',
      region: facility?.region_name || 'N/A'
    };
  };

  // Calculate waiting time in hours and minutes with correct formatting
  const getWaitingHours = (started_at) => {
    const now = new Date();
    const start = new Date(started_at);
    const diffMs = now - start;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getAssignedUserFullName = (assigned_officer_id) => {
    const matched = employees.find(emp => String(emp.id) === String(assigned_officer_id));
    return matched?.full_name || 'N/A';
  };

  const handleComplete = async (customer) => {
    const currentPoint = customer.next_service_point?.toLowerCase();

    const getUserSelectOptions = () => {
      return employees
        .filter((emp) => emp.jobTitle === "O2C Officer")
        .reduce((acc, emp) => {
          acc[emp.id] = emp.full_name;
          return acc;
        }, {});
    };

    if (jobTitle === 'O2C Officer') {
      // O2C Officer completed flow with Finance/EWM choice
      const { value: selectedRole } = await Swal.fire({
        title: 'Complete Service',
        text: 'Select next service point',
        input: 'select',
        inputOptions: {
          Finance: 'Finance',
          EWM: 'EWM',
        },
        inputPlaceholder: 'Select next service point',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });

      if (!selectedRole) return;

      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id,
          next_service_point: selectedRole,
          assigned_officer_id: null // Clear assigned officer as not O2C anymore
        });
        Swal.fire('Success', 'Service point updated', 'success');
        fetchData();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to update service', 'error');
      }

    } else if (jobTitle === 'Finance') {
      // Finance flow same as before: choose next service point with assigned user if O2C
      const nextOptions = {
        O2C: 'O2C',
        Manager: 'Manager',
        'Customer Service': 'Customer Service'
      };

      const { value: selectedRole } = await Swal.fire({
        title: 'Select next service point',
        input: 'select',
        inputOptions: nextOptions,
        inputPlaceholder: 'Select',
        showCancelButton: true,
      });

      if (!selectedRole) return;

      let assignedOfficerId = null;
      if (selectedRole === 'O2C') {
        const { value: selectedUserId } = await Swal.fire({
          title: 'Assign user to O2C',
          input: 'select',
          inputOptions: getUserSelectOptions(),
          inputPlaceholder: 'Select a user',
          showCancelButton: true,
        });

        if (!selectedUserId) {
          Swal.fire('Cancelled', 'No user assigned to O2C.', 'info');
          return;
        }
        assignedOfficerId = selectedUserId;
      }

      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id,
          next_service_point: selectedRole,
          assigned_officer_id: assignedOfficerId,
        });
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to update service', 'error');
      }

    } else if (jobTitle === 'Customer Service Officer') {
      // Customer Service Officer: choice between O2C (with assign user) or Finance
      const nextOptions = {
        O2C: 'O2C',
        Finance: 'Finance',
      };

      const { value: selectedRole } = await Swal.fire({
        title: 'Select next service point',
        input: 'select',
        inputOptions: nextOptions,
        inputPlaceholder: 'Select',
        showCancelButton: true,
      });

      if (!selectedRole) return;

      let assignedOfficerId = null;
      if (selectedRole === 'O2C') {
        const { value: selectedUserId } = await Swal.fire({
          title: 'Assign user to O2C',
          input: 'select',
          inputOptions: getUserSelectOptions(),
          inputPlaceholder: 'Select a user',
          showCancelButton: true,
        });

        if (!selectedUserId) {
          Swal.fire('Cancelled', 'No user assigned to O2C.', 'info');
          return;
        }
        assignedOfficerId = selectedUserId;
      }

      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id,
          next_service_point: selectedRole,
          assigned_officer_id: assignedOfficerId,
        });
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to update service', 'error');
      }

    } else if (jobTitle === 'Manager') {
      // Manager: just update to Customer Service without dialog
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id,
          next_service_point: 'Customer Service',
          assigned_officer_id: null,
        });
        Swal.fire('Updated!', 'Service point updated to Customer Service.', 'success');
        fetchData();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else if (jobTitle === 'EWM Officer') {
      // For EWM Officer: add return button (see below) and completed changes next service point to Customer, status to Completed
      // Here handle completed button:

      const now = new Date().toISOString();
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id,
          next_service_point: 'Customer',
          status: 'Completed',
          assigned_officer_id: null,
          completed_at:now
        });
        Swal.fire('Updated!', 'Service completed and moved to Customer.', 'success');
        fetchData();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else {
      Swal.fire("Notice", "Unhandled service point or user role. Please check the data.", "info");
    }
  };

  // Return button handler specifically for EWM officer to return customer to O2C
  const handleReturn = async (customer) => {
    if (jobTitle !== 'EWM Officer') return;

    const getUserSelectOptions = () => {
      return employees
        .filter((emp) => emp.jobTitle === "O2C Officer")
        .reduce((acc, emp) => {
          acc[emp.id] = emp.full_name;
          return acc;
        }, {});
    };

    const { value: selectedUserId } = await Swal.fire({
      title: 'Assign user to O2C for return',
      input: 'select',
      inputOptions: getUserSelectOptions(),
      inputPlaceholder: 'Select a user',
      showCancelButton: true,
    });

    if (!selectedUserId) {
      Swal.fire('Cancelled', 'No user assigned to O2C.', 'info');
      return;
    }

    try {
      await axios.put('http://localhost:3001/api/update-service-point', {
        id: customer.id,
        next_service_point: 'O2C',
        assigned_officer_id: selectedUserId,
      });
      Swal.fire('Returned!', 'Customer returned to O2C.', 'success');
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to return customer.', 'error');
    }
  };

  const filterCustomers = () => {
    if (!jobTitle || !userId) return [];

    if (jobTitle === "Admin") {
      return customers;
    }

    if (jobTitle === "O2C Officer") {
      return customers.filter(c => String(c.assigned_officer_id) === String(userId));
    }

    // Map localStorage jobTitle to serviceList next_service_point value
    const jobTitleToServicePointMap = {
      "Customer Service Officer": "customer service",
      "EWM Officer": "ewm",
      "Manager": "manager"
    };

    const normalizedJobTitle = jobTitleToServicePointMap[jobTitle] || jobTitle.toLowerCase();

    return customers.filter(c =>
      c.next_service_point?.toLowerCase() === normalizedJobTitle
    );
  };

  const filtered = filterCustomers();

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Outstanding Customers
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Facility</TableCell>
              <TableCell>Woreda</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Customer Type</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell>Current Service Point</TableCell>
              <TableCell>Assigned User</TableCell>
              {jobTitle === 'EWM Officer' && <TableCell>Return</TableCell>}
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={jobTitle === 'EWM Officer' ? 10 : 9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={jobTitle === 'EWM Officer' ? 10 : 9} align="center">
                  No outstanding customers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => {
                const {
                  name,
                  woreda,
                  zone,
                  region
                } = getFacilityDetails(customer.facility_id);

                const assignedUser = getAssignedUserFullName(customer.assigned_officer_id);

                return (
                  <TableRow key={customer.id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{woreda}</TableCell>
                    <TableCell>{zone}</TableCell>
                    <TableCell>{region}</TableCell>
                    <TableCell>{customer.customer_type}</TableCell>
                    <TableCell>{getWaitingHours(customer.started_at)}</TableCell>
                    <TableCell>{customer.next_service_point || "N/A"}</TableCell>
                    <TableCell>{assignedUser}</TableCell>
                    {jobTitle === 'EWM Officer' && (
                      <TableCell>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleReturn(customer)}
                        >
                          Return
                        </Button>
                      </TableCell>
                    )}
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleComplete(customer)}
                      >
                        Completed
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OutstandingCustomers;

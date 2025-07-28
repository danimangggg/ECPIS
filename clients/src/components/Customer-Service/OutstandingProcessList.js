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
      const customerRes = await axios.get('http://localhost:3001/api/serviceList');
      setCustomers(customerRes.data);
    } catch (error) {
      console.error("Error fetching customer data:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to fetch customer data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaticData = async () => {
    try {
      const [facilityRes, employeeRes] = await Promise.all([
        axios.get('http://localhost:3001/api/facilities'),
        axios.get('http://localhost:3001/api/get-employee'),
      ]);
      setFacilities(facilityRes.data);
      setEmployees(employeeRes.data);
    } catch (error) {
      console.error("Error fetching static data:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to fetch facility or employee data.', 'error');
    }
  };

  useEffect(() => {
    fetchStaticData();
    fetchData();
  }, []);

  const getFacilityDetails = (facilityId) => {
    const facility = facilities.find(f => f.id === facilityId);
    return {
      name: facility?.facility_name || 'N/A',
      woreda: facility?.woreda_name || 'N/A',
    };
  };

  const getWaitingHours = (started_at) => {
    if (!started_at) return 'N/A';
    const now = new Date();
    const start = new Date(started_at);
    const diffMs = now - start;
    if (diffMs < 0) return '0h 0m';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getAssignedUserFullName = (assigned_officer_id) => {
    const matched = employees.find(emp => String(emp.id) === String(assigned_officer_id));
    return matched?.full_name || 'N/A';
  };

  const updateServiceStatus = async (customer, newStatus, startedAt = null) => {
    try {
      await axios.put('http://localhost:3001/api/update-service-point', {
        id: customer.id,
        status: newStatus,
        started_at: startedAt,
        next_service_point: customer.next_service_point,
        assigned_officer_id: customer.assigned_officer_id,
        completed_at: customer.completed_at
      });
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id ? {
            ...c,
            status: newStatus,
            started_at: (startedAt !== null) ? startedAt : c.started_at
          } : c
        )
      );
      Swal.fire('Success', `Customer status updated to ${newStatus}.`, 'success');
      return true;
    } catch (error) {
      console.error("Error updating service status:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to update service status', 'error');
      return false;
    }
  };

  const handleO2CStatusFlow = async (customer, action) => {
    let newStatus;
    let startedAt = customer.started_at;

    if (action === 'notify') {
      newStatus = 'notifying';
    } else if (action === 'start') {
      newStatus = 'o2c_started';
      if (!customer.started_at || customer.status !== 'o2c_started') {
          startedAt = new Date().toISOString();
      }
    } else if (action === 'stop') { // NEW: Handle 'stop' action
        newStatus = 'started'; // Revert status back to 'started'
        startedAt = null; // Clear started_at when reverting
    }

    await updateServiceStatus(customer, newStatus, startedAt);
  };

  const handleComplete = async (customer) => {
    const getUserSelectOptions = () => {
      return employees
        .filter((emp) => emp.jobTitle === "O2C Officer")
        .reduce((acc, emp) => {
          acc[emp.id] = emp.full_name;
          return acc;
        }, {});
    };

    if (jobTitle === 'O2C Officer') {
      const statusUpdateSuccess = await updateServiceStatus(customer, 'o2c_completed');
      if (!statusUpdateSuccess) return;

      const { value: selectedRole } = await Swal.fire({
        title: 'Complete Service',
        text: 'Select next service point',
        input: 'select',
        inputOptions: { Finance: 'Finance', EWM: 'EWM' },
        inputPlaceholder: 'Select next service point',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });

      if (!selectedRole) return;

      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id, next_service_point: selectedRole, assigned_officer_id: null
        });
        Swal.fire('Success', 'Service point updated', 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service point', 'error');
      }

    } else if (jobTitle === 'Finance') {
      const nextOptions = { O2C: 'O2C', Manager: 'Manager', 'Customer Service': 'Customer Service' };
      const { value: selectedRole } = await Swal.fire({
        title: 'Select next service point', input: 'select', inputOptions: nextOptions,
        inputPlaceholder: 'Select', showCancelButton: true,
      });
      if (!selectedRole) return;

      let assignedOfficerId = null;
      if (selectedRole === 'O2C') {
        const { value: selectedUserId } = await Swal.fire({
          title: 'Assign user to O2C', input: 'select', inputOptions: getUserSelectOptions(),
          inputPlaceholder: 'Select a user', showCancelButton: true,
        });
        if (!selectedUserId) { Swal.fire('Cancelled', 'No user assigned to O2C.', 'info'); return; }
        assignedOfficerId = selectedUserId;
      }
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id, next_service_point: selectedRole, assigned_officer_id: assignedOfficerId,
        });
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }

    } else if (jobTitle === 'Customer Service Officer') {
      const nextOptions = { O2C: 'O2C', Finance: 'Finance' };
      const { value: selectedRole } = await Swal.fire({
        title: 'Select next service point', input: 'select', inputOptions: nextOptions,
        inputPlaceholder: 'Select', showCancelButton: true,
      });
      if (!selectedRole) return;

      let assignedOfficerId = null;
      if (selectedRole === 'O2C') {
        const { value: selectedUserId } = await Swal.fire({
          title: 'Assign user to O2C', input: 'select', inputOptions: getUserSelectOptions(),
          inputPlaceholder: 'Select a user', showCancelButton: true,
        });
        if (!selectedUserId) { Swal.fire('Cancelled', 'No user assigned to O2C.', 'info'); return; }
        assignedOfficerId = selectedUserId;
      }
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id, next_service_point: selectedRole, assigned_officer_id: assignedOfficerId,
        });
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }

    } else if (jobTitle === 'Manager') {
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id, next_service_point: 'Customer Service', assigned_officer_id: null,
        });
        Swal.fire('Updated!', 'Service point updated to Customer Service.', 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else if (jobTitle === 'EWM Officer') {
      const now = new Date().toISOString();
      try {
        await axios.put('http://localhost:3001/api/update-service-point', {
          id: customer.id, next_service_point: 'Customer', status: 'Completed',
          assigned_officer_id: null, completed_at: now
        });
        Swal.fire('Updated!', 'Service completed and moved to Customer.', 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else {
      Swal.fire("Notice", "Unhandled service point or user role. Please check the data.", "info");
    }
  };

  const handleReturn = async (customer) => {
    if (jobTitle !== 'EWM Officer') return;
    const getUserSelectOptions = () => employees.filter((emp) => emp.jobTitle === "O2C Officer").reduce((acc, emp) => { acc[emp.id] = emp.full_name; return acc; }, {});
    const { value: selectedUserId } = await Swal.fire({
      title: 'Assign user to O2C for return', input: 'select', inputOptions: getUserSelectOptions(),
      inputPlaceholder: 'Select a user', showCancelButton: true,
    });
    if (!selectedUserId) { Swal.fire('Cancelled', 'No user assigned to O2C.', 'info'); return; }
    try {
      await axios.put('http://localhost:3001/api/update-service-point', {
        id: customer.id, next_service_point: 'O2C', assigned_officer_id: selectedUserId, status: 'pending'
      });
      Swal.fire('Returned!', 'Customer returned to O2C.', 'success');
      fetchData();
    } catch (error) {
      console.error("Error returning customer:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to return customer.', 'error');
    }
  };

  const filterCustomers = () => {
    if (!jobTitle || !userId) return [];
    if (jobTitle === "Admin") return customers;

    if (jobTitle === "O2C Officer") {
      return customers.filter(c =>
        String(c.assigned_officer_id) === String(userId) &&
        c.status !== 'o2c_completed' &&
        c.status !== 'Completed'
      );
    }

    const jobTitleToServicePointMap = {
      "Customer Service Officer": "customer service", "EWM Officer": "ewm", "Manager": "manager"
    };
    const normalizedJobTitle = jobTitleToServicePointMap[jobTitle] || jobTitle.toLowerCase();
    return customers.filter(c => c.next_service_point?.toLowerCase() === normalizedJobTitle);
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
              <TableCell>Customer Type</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell>Current Service Point</TableCell>
              <TableCell>Assigned User</TableCell>
              <TableCell>Status</TableCell>
              {jobTitle === 'EWM Officer' && <TableCell>Return</TableCell>}
              <TableCell sx={{ minWidth: '220px' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={jobTitle === 'EWM Officer' ? 8 : 7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={jobTitle === 'EWM Officer' ? 8 : 7} align="center">
                  No outstanding customers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => {
                const { name, woreda } = getFacilityDetails(customer.facility_id);
                const assignedUser = getAssignedUserFullName(customer.assigned_officer_id);

                const normalizedStatus = customer.status ? String(customer.status).trim().toLowerCase() : null;

                const showNotifyButton = normalizedStatus === null || normalizedStatus === '' || normalizedStatus === 'started';
                const showStartAndStopButtons = normalizedStatus === 'notifying'; // Show both Start and Stop
                const showCompleteButton = normalizedStatus === 'o2c_started';

                return (
                  <TableRow key={customer.id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{woreda}</TableCell>
                    <TableCell>{customer.customer_type}</TableCell>
                    <TableCell>{getWaitingHours(customer.started_at)}</TableCell>
                    <TableCell>{customer.next_service_point || "N/A"}</TableCell>
                    <TableCell>{assignedUser}</TableCell>
                    <TableCell>{customer.status || 'pending'}</TableCell>
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
                      {jobTitle === 'O2C Officer' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {showNotifyButton && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleO2CStatusFlow(customer, 'notify')}
                              size="small"
                            >
                              Notify
                            </Button>
                          )}
                          {showStartAndStopButtons && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleO2CStatusFlow(customer, 'start')}
                                size="small"
                              >
                                Start
                              </Button>
                              <Button
                                variant="contained"
                                color="error" // Red for stop/revert
                                onClick={() => handleO2CStatusFlow(customer, 'stop')}
                                size="small"
                              >
                                Stop
                              </Button>
                            </>
                          )}
                          {showCompleteButton && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleComplete(customer)}
                              size="small"
                            >
                              Complete
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleComplete(customer)}
                        >
                          Completed
                        </Button>
                      )}
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
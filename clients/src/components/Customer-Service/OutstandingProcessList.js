import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, CircularProgress, Box, Chip
} from '@mui/material';

const OutstandingCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const jobTitle = localStorage.getItem("JobTitle");
  const userId = localStorage.getItem("UserId");

  // API URL is now handled with a fallback for consistency
  const api_url = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    setLoading(true);
    try {
      const customerRes = await axios.get(`${api_url}/api/serviceList`);
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
        axios.get(`${api_url}/api/facilities`),
        axios.get(`${api_url}/api/get-employee`),
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
    const interval = setInterval(fetchData, 5000); // Poll for new data every 5 seconds
    return () => clearInterval(interval);
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

  const updateServiceStatus = async (customer, newStatus, startedAt = null, assignedOfficerId = null, nextServicePoint = null, completedAt = null) => {
    try {
      await axios.put(`${api_url}/api/update-service-point`, {
        id: customer.id,
        status: newStatus,
        started_at: (startedAt !== null) ? startedAt : customer.started_at,
        next_service_point: (nextServicePoint !== null) ? nextServicePoint : customer.next_service_point,
        assigned_officer_id: assignedOfficerId,
        completed_at: (completedAt !== null) ? completedAt : customer.completed_at
      });
      setCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customer.id ? {
            ...c,
            status: newStatus,
            started_at: (startedAt !== null) ? startedAt : c.started_at,
            next_service_point: (nextServicePoint !== null) ? nextServicePoint : c.next_service_point,
            assigned_officer_id: assignedOfficerId,
            completed_at: (completedAt !== null) ? completedAt : c.completed_at
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
    let newStatus = customer.status;
    let startedAt = customer.started_at;
    let assignedOfficerToKeep = customer.assigned_officer_id;

    if (action === 'notify') {
      newStatus = 'notifying';
    } else if (action === 'start') {
      newStatus = 'o2c_started';
      if (!customer.started_at || customer.status !== 'o2c_started') {
        startedAt = new Date().toISOString();
      }
    } else if (action === 'stop') {
      newStatus = 'started';
      startedAt = null;
    }

    await updateServiceStatus(customer, newStatus, startedAt, assignedOfficerToKeep);
  };

  // --- NEW: Manager-specific handleApprove function ---
  const handleApprove = async (customer) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Approval',
      text: 'Are you sure you want to approve this customer and send to Customer Service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'No, cancel',
    });

    if (!isConfirmed) {
      Swal.fire('Cancelled', 'Approval action cancelled.', 'info');
      return;
    }

    try {
      await updateServiceStatus(
        customer,
        'approved', // New status for approved customers
        customer.started_at,
        customer.assigned_officer_id,
        'Customer Service' // Next service point
      );
      Swal.fire('Updated!', 'Customer approved and sent to Customer Service.', 'success');
      fetchData();
    } catch (error) {
      console.error("Error approving customer:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to approve customer.', 'error');
    }
  };

  // --- NEW: Manager-specific handleReject function ---
  const handleReject = async (customer) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Rejection',
      text: 'Are you sure you want to reject this customer? This action is permanent.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'No, cancel',
    });

    if (!isConfirmed) {
      Swal.fire('Cancelled', 'Rejection action cancelled.', 'info');
      return;
    }

    try {
      await updateServiceStatus(
        customer,
        'rejected', // New status for rejected customers
        customer.started_at,
        customer.assigned_officer_id,
        customer.next_service_point // Keep the next service point the same
      );
      Swal.fire('Updated!', 'Customer has been rejected.', 'success');
      fetchData();
    } catch (error) {
      console.error("Error rejecting customer:", error.response ? error.response.data : error.message);
      Swal.fire('Error', 'Failed to reject customer.', 'error');
    }
  };


  const handleComplete = async (customer) => {
    // This function handles completion for all roles other than Manager
    const getUserSelectOptions = () => {
      return employees
        .filter((emp) => emp.jobTitle === "O2C Officer")
        .reduce((acc, emp) => {
          acc[emp.id] = emp.full_name;
          return acc;
        }, {});
    };

    if (jobTitle === 'O2C Officer') {
      const { value: selectedRole, isConfirmed } = await Swal.fire({
        title: 'Complete Service',
        text: 'Select next service point',
        input: 'select',
        inputOptions: { Finance: 'Finance', EWM: 'EWM' },
        inputPlaceholder: 'Select next service point',
        showCancelButton: true,
        confirmButtonText: 'Submit',
      });
      if (!isConfirmed) {
        Swal.fire('Cancelled', 'Service completion cancelled.', 'info');
        return;
      }

      try {
        await axios.put(`${api_url}/api/update-service-point`, {
          id: customer.id,
          status: 'o2c_completed',
          next_service_point: selectedRole,
          assigned_officer_id: customer.assigned_officer_id
        });
        Swal.fire('Success', 'Service point updated', 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service point', 'error');
      }

    } else if (jobTitle === 'Finance') {
      const nextOptions = { O2C: 'O2C', Manager: 'Manager', 'Customer Service': 'Customer Service' };
      const { value: selectedRole, isConfirmed } = await Swal.fire({
        title: 'Select next service point',
        input: 'select',
        inputOptions: nextOptions,
        inputPlaceholder: 'Select',
        showCancelButton: true,
      });
      if (!isConfirmed) return;

      let assignedOfficerId = customer.assigned_officer_id;
      let newStatus = customer.status;

      if (selectedRole === 'O2C') {
        if (!customer.assigned_officer_id) {
          const { value: selectedUserId, isConfirmed: userConfirmedAssignment } = await Swal.fire({
            title: 'Assign O2C Officer',
            input: 'select', inputOptions: getUserSelectOptions(),
            inputPlaceholder: 'Select an O2C Officer',
            showCancelButton: true,
          });
          if (!userConfirmedAssignment) {
            Swal.fire('Cancelled', 'No O2C Officer assigned. Action cancelled.', 'info');
            return;
          }
          assignedOfficerId = selectedUserId;
        } else {
             Swal.fire('Info', 'O2C Officer is already assigned. Keeping current assignment.', 'info');
        }
        newStatus = 'started';
      }

      try {
        await updateServiceStatus(
          customer,
          newStatus,
          customer.started_at,
          assignedOfficerId,
          selectedRole
        );
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else if (jobTitle === 'Customer Service Officer') {
      const nextOptions = { O2C: 'O2C', Finance: 'Finance' };
      const { value: selectedRole, isConfirmed } = await Swal.fire({
        title: 'Select next service point',
        input: 'select',
        inputOptions: nextOptions,
        inputPlaceholder: 'Select',
        showCancelButton: true,
      });
      if (!isConfirmed) return;

      let assignedOfficerId = customer.assigned_officer_id;
      let newStatus = customer.status;

      if (selectedRole === 'O2C') {
        if (!customer.assigned_officer_id) {
          const { value: selectedUserId, isConfirmed: userConfirmedAssignment } = await Swal.fire({
            title: 'Assign O2C Officer',
            input: 'select', inputOptions: getUserSelectOptions(),
            inputPlaceholder: 'Select an O2C Officer',
            showCancelButton: true,
          });
          if (!userConfirmedAssignment) {
            Swal.fire('Cancelled', 'No O2C Officer assigned. Action cancelled.', 'info');
            return;
          }
          assignedOfficerId = selectedUserId;
        } else {
             Swal.fire('Info', 'O2C Officer is already assigned. Keeping current assignment.', 'info');
        }
        newStatus = 'started';
      }

      try {
        await updateServiceStatus(
          customer,
          newStatus,
          customer.started_at,
          assignedOfficerId,
          selectedRole
        );
        Swal.fire('Updated!', `Service point updated to ${selectedRole}.`, 'success');
        fetchData();
      } catch (error) {
        console.error("Error updating service point:", error.response ? error.response.data : error.message);
        Swal.fire('Error', 'Failed to update service', 'error');
      }
    } else if (jobTitle === 'EWM Officer') {
      const { isConfirmed } = await Swal.fire({
        title: 'Confirm Completion',
        text: 'Are you sure you want to complete this service and send to Customer?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, complete it!',
        cancelButtonText: 'No, cancel',
      });
      if (!isConfirmed) {
        Swal.fire('Cancelled', 'Service completion cancelled.', 'info');
        return;
      }

      const now = new Date().toISOString();
      try {
        await axios.put(`${api_url}/api/update-service-point`, {
          id: customer.id,
          next_service_point: 'Customer',
          status: 'Completed',
          assigned_officer_id: customer.assigned_officer_id,
          completed_at: now
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

    let assignedOfficerIdForReturn = customer.assigned_officer_id;

    if (!assignedOfficerIdForReturn) {
        const { value: selectedUserId, isConfirmed } = await Swal.fire({
            title: 'Assign O2C Officer for return',
            input: 'select',
            inputOptions: getUserSelectOptions(),
            inputPlaceholder: 'Select an O2C Officer',
            showCancelButton: true,
        });
        if (!isConfirmed) { Swal.fire('Cancelled', 'No O2C Officer assigned. Return cancelled.', 'info'); return; }
        assignedOfficerIdForReturn = selectedUserId;
    } else {
        Swal.fire('Info', `Customer will be returned to previously assigned O2C Officer: ${getAssignedUserFullName(assignedOfficerIdForReturn)}.`, 'info');
    }

    try {
      await updateServiceStatus(
        customer,
        'started',
        null,
        assignedOfficerIdForReturn,
        'O2C'
      );
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
    // Filter for manager, showing all customers that require their action.
    if (jobTitle === 'Manager') {
        return customers.filter(c =>
            c.next_service_point?.toLowerCase() === 'manager' &&
            c.status?.toLowerCase() !== 'rejected' &&
            c.status?.toLowerCase() !== 'approved'
        );
    }

    const jobTitleToServicePointMap = {
      "Customer Service Officer": "customer service", "EWM Officer": "ewm"
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
              <TableCell>O2C Officer</TableCell>
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
                const showStartAndStopButtons = normalizedStatus === 'notifying';
                const showCompleteButton = normalizedStatus === 'o2c_started';

                return (
                  <TableRow key={customer.id}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{woreda}</TableCell>
                    <TableCell>{customer.customer_type}</TableCell>
                    <TableCell>{getWaitingHours(customer.started_at)}</TableCell>
                    <TableCell>{customer.next_service_point || "N/A"}</TableCell>
                    <TableCell>{assignedUser}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status || 'pending'}
                        color={customer.status === 'rejected' ? 'error' : customer.status === 'approved' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
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
                                color="error"
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
                        // NEW: Manager-specific buttons, otherwise show generic 'Completed'
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {jobTitle === 'Manager' ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApprove(customer)}
                                size="small"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleReject(customer)}
                                size="small"
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleComplete(customer)}
                            >
                              Completed
                            </Button>
                          )}
                        </Box>
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

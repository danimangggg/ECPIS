import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Typography, CircularProgress, Box, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

// Load Tone.js dynamically for audio notifications
const Tone = window.Tone;
if (!Tone) {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js";
    document.head.appendChild(script);
}

const OutstandingCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [previousOutstandingCount, setPreviousOutstandingCount] = useState(0);

    const jobTitle = localStorage.getItem("JobTitle");
    const userId = localStorage.getItem("UserId");

    // API URL with a fallback for development
    const api_url = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // State to manage a persistent sound player for the alarm
    const [player, setPlayer] = useState(null);
    useEffect(() => {
        if (Tone) {
            const p = new Tone.Player({
                url: "https://tonejs.github.io/audio/berlin/3.mp3",
                loop: true,
                fadeOut: "4n",
            }).toDestination();
            setPlayer(p);
        }
    }, []);

    // Effect to control the audio player and notification snackbar
    useEffect(() => {
        if (isNotifying) {
            if (player) {
                // Ensure audio context is started
                Tone.start();
                player.start();
                setNotificationOpen(true);
            }
        } else {
            if (player && player.state === 'started') {
                player.stop();
            }
        }
        // Cleanup function to stop audio on component unmount
        return () => {
            if (player) {
                player.stop();
            }
        };
    }, [isNotifying, player]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const customerRes = await axios.get(`${api_url}/api/serviceList`);
            const filteredData = customerRes.data.filter(c =>
                (String(c.assigned_officer_id) === String(userId) && c.status !== 'o2c_completed' && c.status !== 'complete') ||
                (jobTitle === 'Manager' && c.next_service_point?.toLowerCase() === 'manager' && c.status?.toLowerCase() !== 'rejected' && c.status?.toLowerCase() !== 'approved') ||
                (c.next_service_point?.toLowerCase() === jobTitle.toLowerCase() && c.status?.toLowerCase() !== 'complete')
            );
            const currentOutstandingCount = filteredData.length;

            // Fix for notification logic: trigger notification if the number of tasks increases.
            if (currentOutstandingCount > previousOutstandingCount) {
                setIsNotifying(true);
            } else {
                setIsNotifying(false);
            }
            setPreviousOutstandingCount(currentOutstandingCount);
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
        const interval = setInterval(fetchData, 30000); // Poll for new data every 30 seconds
        return () => clearInterval(interval);
    }, [jobTitle, userId, api_url]);

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

    const updateServiceStatus = async (customer, newStatus, startedAt = null, assignedOfficerId = null, nextServicePoint = null, completedAt = null, outboundDeliveryNumber = null) => {
        try {
            await axios.put(`${api_url}/api/update-service-point`, {
                id: customer.id,
                status: newStatus,
                started_at: (startedAt !== null) ? startedAt : customer.started_at,
                next_service_point: (nextServicePoint !== null) ? nextServicePoint : customer.next_service_point,
                assigned_officer_id: assignedOfficerId,
                completed_at: (completedAt !== null) ? completedAt : customer.completed_at,
                outbound_delivery_number: (outboundDeliveryNumber !== null) ? outboundDeliveryNumber : customer.outbound_delivery_number
            });
            setCustomers(prevCustomers =>
                prevCustomers.map(c =>
                    c.id === customer.id ? {
                        ...c,
                        status: newStatus,
                        started_at: (startedAt !== null) ? startedAt : c.started_at,
                        next_service_point: (nextServicePoint !== null) ? nextServicePoint : c.next_service_point,
                        assigned_officer_id: assignedOfficerId,
                        completed_at: (completedAt !== null) ? completedAt : c.completed_at,
                        outbound_delivery_number: (outboundDeliveryNumber !== null) ? outboundDeliveryNumber : c.outbound_delivery_number
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
            newStatus = 'o2c notifying';
        } else if (action === 'start') {
            newStatus = 'o2c started';
            if (!customer.started_at || customer.status !== 'o2c started') {
                startedAt = new Date().toISOString();
            }
        } else if (action === 'stop') {
            // Restore 'started' status and clear the start time
            newStatus = 'started';
            startedAt = null;
        }

        await updateServiceStatus(customer, newStatus, startedAt, assignedOfficerToKeep);
    };

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
                'manager completed',
                customer.started_at,
                customer.assigned_officer_id,
                'Customer Service'
            );
            Swal.fire('Updated!', 'Customer approved and sent to Customer Service.', 'success');
            fetchData();
        } catch (error) {
            console.error("Error approving customer:", error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to approve customer.', 'error');
        }
    };

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
                'rejected',
                customer.started_at,
                customer.assigned_officer_id,
                customer.next_service_point
            );
            Swal.fire('Updated!', 'Customer has been rejected.', 'success');
            fetchData();
        } catch (error) {
            console.error("Error rejecting customer:", error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to reject customer.', 'error');
        }
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

            let outboundDeliveryNumber = null;
            if (selectedRole === 'EWM') {
                const { value: deliveryNumber, isConfirmed: numberConfirmed } = await Swal.fire({
                    title: 'Enter Outbound Delivery Number',
                    input: 'text',
                    inputPlaceholder: 'e.g., 300056624',
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                });
                if (!numberConfirmed) {
                    Swal.fire('Cancelled', 'Delivery number not saved. Action cancelled.', 'info');
                    return;
                }
                outboundDeliveryNumber = deliveryNumber;
            }

            try {
                await updateServiceStatus(
                    customer,
                    'o2c completed',
                    null,
                    customer.assigned_officer_id,
                    selectedRole,
                    new Date().toISOString(),
                    outboundDeliveryNumber
                );
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
            let newStatus = 'finance completed';

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
                    selectedRole,
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
            let newStatus = 'registration completed';

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
                newStatus = 'o2c-officer assigned';
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
                await updateServiceStatus(
                    customer,
                    'completed',
                    null,
                    customer.assigned_officer_id,
                    'Customer',
                    now
                );
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
                'o2c started',
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
                c.status !== 'o2c completed' &&
                c.status !== 'completed'
            );
        }
        // Filter for manager, showing all customers that require their action.
        if (jobTitle === 'Manager') {
            return customers.filter(c =>
                c.next_service_point?.toLowerCase() === 'manager' &&
                c.status?.toLowerCase() !== 'rejected' &&
                c.status?.toLowerCase() !== 'manager completed'
            );
        }

        const jobTitleToServicePointMap = {
            "Customer Service Officer": "customer service", "EWM Officer": "ewm"
        };
        const normalizedJobTitle = jobTitleToServicePointMap[jobTitle] || jobTitle.toLowerCase();
        return customers.filter(c => c.next_service_point?.toLowerCase() === normalizedJobTitle);
    };

    const filtered = filterCustomers();

    const handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotificationOpen(false);
        setIsNotifying(false);
    };

    return (
        <Box p={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Outstanding Customers
                </Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Facility</TableCell>
                            <TableCell>Woreda</TableCell>
                            <TableCell>Customer Type</TableCell>
                            <TableCell>Waiting</TableCell>
                            {/* Conditionally render O2C Officer column */}
                            {jobTitle !== 'O2C Officer' && <TableCell>O2C Officer</TableCell>}
                            {jobTitle === 'EWM Officer' && <TableCell>Outbound Delivery #</TableCell>}
                            {jobTitle === 'EWM Officer' && <TableCell>Return</TableCell>}
                            <TableCell sx={{ minWidth: '220px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={jobTitle === 'EWM Officer' ? 7 : 6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={jobTitle === 'EWM Officer' ? 7 : 6} align="center">
                                    No outstanding customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((customer) => {
                                const { name, woreda } = getFacilityDetails(customer.facility_id);
                                const assignedUser = getAssignedUserFullName(customer.assigned_officer_id);
                                const normalizedStatus = customer.status ? String(customer.status).trim().toLowerCase() : null;
                                // Corrected conditional logic to use new status strings
                                const showNotifyButton = jobTitle === 'O2C Officer' && (normalizedStatus === null || normalizedStatus === '' || normalizedStatus === 'started');
                                const showStartButton = jobTitle === 'O2C Officer' && normalizedStatus === 'o2c notifying';
                                const showStopButton = jobTitle === 'O2C Officer' && normalizedStatus === 'o2c started';
                                const showCompleteButton = (jobTitle === 'O2C Officer' && normalizedStatus === 'o2c started') || (jobTitle === 'EWM Officer' && customer.next_service_point?.toLowerCase() === 'ewm') || jobTitle === 'Finance' || jobTitle === 'Customer Service Officer';

                                return (
                                    <TableRow key={customer.id}>
                                        <TableCell>{name}</TableCell>
                                        <TableCell>{woreda}</TableCell>
                                        <TableCell>{customer.customer_type}</TableCell>
                                        <TableCell>{getWaitingHours(customer.started_at)}</TableCell>
                                        {/* Conditionally render O2C Officer data cell */}
                                        {jobTitle !== 'O2C Officer' && <TableCell>{assignedUser}</TableCell>}
                                        {jobTitle === 'EWM Officer' && (
                                            <TableCell>
                                                {customer.outbound_delivery_number || 'N/A'}
                                            </TableCell>
                                        )}
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
                                                    {showStartButton && (
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
                                                            size="small"
                                                            disabled={!customer.next_service_point}
                                                        >
                                                            {jobTitle === 'EWM Officer' ? 'Complete' : 'Move Forward'}
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
            <Snackbar
                open={notificationOpen}
                autoHideDuration={60000}
                onClose={handleNotificationClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <MuiAlert onClose={handleNotificationClose} severity="info" sx={{ width: '100%' }}>
                    New outstanding customers have been added.
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default OutstandingCustomers;
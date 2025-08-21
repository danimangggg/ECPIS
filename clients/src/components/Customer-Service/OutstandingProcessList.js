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
    const userStore = localStorage.getItem("store");
    const normalizedUserStore = (userStore || '').toUpperCase();

    const api_url = process.env.REACT_APP_API_URL;

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
        const interval = setInterval(fetchData, 30000);
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

    const getAssignedStoreNames = (customer) => {
        const assignedStores = [];
        if (customer.store_id_1) assignedStores.push(customer.store_id_1);
        if (customer.store_id_2) assignedStores.push(customer.store_id_2);
        if (customer.store_id_3) assignedStores.push(customer.store_id_3);
        return assignedStores.join(', ');
    };

    const getStoreODN = (customer) => {
        if (normalizedUserStore === 'AA1') return customer.aa1_odn || 'N/A';
        if (normalizedUserStore === 'AA2') return customer.aa2_odn || 'N/A';
        if (normalizedUserStore === 'AA3') return customer.aa3_odn || 'N/A';
        return 'N/A';
    };

    const updateServiceStatus = async (customer, newStatus, startedAt = null, assignedOfficerId = undefined, nextServicePoint = undefined, completedAt = undefined, data = undefined) => {
        const payload = {
            id: customer.id,
            status: newStatus,
            started_at: (startedAt !== null) ? startedAt : customer.started_at,
            next_service_point: (nextServicePoint !== undefined) ? nextServicePoint : customer.next_service_point,
            assigned_officer_id: assignedOfficerId !== undefined ? assignedOfficerId : customer.assigned_officer_id,
            completed_at: (completedAt !== undefined) ? completedAt : customer.completed_at,
            ...data // Spread the additional data
        };

        try {
            await axios.put(`${api_url}/api/update-service-point`, payload);
            fetchData();
            Swal.fire('Success', `Customer status updated to ${newStatus}.`, 'success');
            return true;
        } catch (error) {
            console.error("Error updating service status:", error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to update service status', 'error');
            return false;
        }
    };

    const completeStoreTask = async (customer) => {
        const completionData = {
            id: customer.id,
            next_service_point: customer.next_service_point,
            assigned_officer_id: customer.assigned_officer_id,
            status: customer.status,
            completed_at: customer.completed_at,
            aa1_odn: customer.aa1_odn,
            aa2_odn: customer.aa2_odn,
            aa3_odn: customer.aa3_odn,
            store_id_1: customer.store_id_1,
            store_id_2: customer.store_id_2,
            store_id_3: customer.store_id_3,
            store_completed_1: customer.store_completed_1,
            store_completed_2: customer.store_completed_2,
            store_completed_3: customer.store_completed_3,
        };

        if (normalizedUserStore === 'AA1') {
            completionData.store_completed_1 = 'true';
        } else if (normalizedUserStore === 'AA2') {
            completionData.store_completed_2 = 'true';
        } else if (normalizedUserStore === 'AA3') {
            completionData.store_completed_3 = 'true';
        }

        try {
            await axios.put(`${api_url}/api/update-service-point`, completionData);

            const customerAfterUpdate = (await axios.get(`${api_url}/api/serviceList`)).data.find(c => c.id === customer.id);
            const allStoresCompleted = (customerAfterUpdate.store_id_1 ? customerAfterUpdate.store_completed_1 === 'true' : true) &&
                (customerAfterUpdate.store_id_2 ? customerAfterUpdate.store_completed_2 === 'true' : true) &&
                (customerAfterUpdate.store_id_3 ? customerAfterUpdate.store_completed_3 === 'true' : true);

            if (allStoresCompleted) {
                await updateServiceStatus(customerAfterUpdate, 'Completed', null, null, null, new Date().toISOString());
                Swal.fire('Completed!', 'You and all assigned stores have completed this task. Service is complete.', 'success');
            } else {
                Swal.fire('Completed!', 'You have completed your part. Waiting for other stores to complete their tasks.', 'success');
            }
            fetchData();
        } catch (error) {
            console.error("Error completing store task:", error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to complete store task', 'error');
        }
    };

    const handleO2CStatusFlow = async (customer, action) => {
        let newStatus = customer.status;
        let startedAt = customer.started_at;

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

        await updateServiceStatus(customer, newStatus, startedAt);
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
                'approved',
                customer.started_at,
                undefined,
                'Customer Service',
                null
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
                undefined,
                customer.next_service_point,
                null
            );
            Swal.fire('Updated!', 'Customer has been rejected.', 'success');
            fetchData();
        } catch (error) {
            console.error("Error rejecting customer:", error.response ? error.response.data : error.message);
            Swal.fire('Error', 'Failed to reject customer.', 'error');
        }
    };

    const handleComplete = async (customer) => {
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

            let updateData = {};
            let newStatus = 'o2c_completed';
            let nextServicePoint = selectedRole;

            if (selectedRole === 'EWM') {
                const { value: selectedStores, isConfirmed: storeConfirmed } = await Swal.fire({
                    title: 'Select Store(s)',
                    html: `
                        <div style="text-align:left;line-height:1.9">
                          <label><input type="checkbox" id="storeAA1" value="AA1"> AA1</label><br/>
                          <label><input type="checkbox" id="storeAA2" value="AA2"> AA2</label><br/>
                          <label><input type="checkbox" id="storeAA3" value="AA3"> AA3</label>
                        </div>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Next',
                    preConfirm: () => {
                        const picks = [];
                        const a1 = document.getElementById('storeAA1');
                        const a2 = document.getElementById('storeAA2');
                        const a3 = document.getElementById('storeAA3');
                        if (a1 && a1.checked) picks.push('AA1');
                        if (a2 && a2.checked) picks.push('AA2');
                        if (a3 && a3.checked) picks.push('AA3');
                        return picks;
                    }
                });

                if (!storeConfirmed) {
                    Swal.fire('Cancelled', 'Store assignment cancelled.', 'info');
                    return;
                }

                const storeToODN = {
                    AA1: null,
                    AA2: null,
                    AA3: null,
                };
                for (const store of selectedStores) {
                    const { value: odn, isConfirmed: odnConfirmed } = await Swal.fire({
                        title: `Enter Outbound Delivery Number for ${store}`,
                        input: 'text',
                        inputPlaceholder: `e.g., DEL12345 for ${store}`,
                        showCancelButton: true,
                        confirmButtonText: 'Save',
                        inputValidator: (value) => !value ? 'ODN is required.' : null,
                    });
                    if (!odnConfirmed) {
                        Swal.fire('Cancelled', `ODN for ${store} not saved. Action cancelled.`, 'info');
                        return;
                    }
                    storeToODN[store] = odn;
                }

                updateData = {
                    aa1_odn: storeToODN['AA1'],
                    aa2_odn: storeToODN['AA2'],
                    aa3_odn: storeToODN['AA3'],
                    store_id_1: selectedStores.includes('AA1') ? 'AA1' : null,
                    store_id_2: selectedStores.includes('AA2') ? 'AA2' : null,
                    store_id_3: selectedStores.includes('AA3') ? 'AA3' : null,
                    store_completed_1: selectedStores.includes('AA1') ? 'false' : 'true',
                    store_completed_2: selectedStores.includes('AA2') ? 'false' : 'true',
                    store_completed_3: selectedStores.includes('AA3') ? 'false' : 'true',
                };
            } else {
                updateData = {
                    aa1_odn: null, aa2_odn: null, aa3_odn: null,
                    store_id_1: null, store_id_2: null, store_id_3: null,
                    store_completed_1: 'true', store_completed_2: 'true', store_completed_3: 'true',
                };
            }

            try {
                // Here, we no longer set an assigned_officer_id for EWM
                await updateServiceStatus(
                    customer,
                    newStatus,
                    null,
                    undefined, // Assigned officer is not set here
                    nextServicePoint,
                    undefined,
                    updateData
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
            let newStatus = customer.status;

            if (selectedRole === 'O2C') {
                if (!customer.assigned_officer_id) {
                    const { value: selectedUserId, isConfirmed: userConfirmedAssignment } = await Swal.fire({
                        title: 'Assign O2C Officer',
                        input: 'select',
                        inputOptions: employees.filter(emp => emp.jobTitle === 'O2C Officer').reduce((acc, emp) => { acc[emp.id] = emp.full_name; return acc; }, {}),
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
            let newStatus = customer.status;

            if (selectedRole === 'O2C') {
                if (!customer.assigned_officer_id) {
                    const { value: selectedUserId, isConfirmed: userConfirmedAssignment } = await Swal.fire({
                        title: 'Assign O2C Officer',
                        input: 'select',
                        inputOptions: employees.filter(emp => emp.jobTitle === 'O2C Officer').reduce((acc, emp) => { acc[emp.id] = emp.full_name; return acc; }, {}),
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
            await completeStoreTask(customer);
        } else {
            Swal.fire("Notice", "Unhandled service point or user role. Please check the data.", "info");
        }
    };

    const handleReturn = async (customer) => {
        if (jobTitle !== 'EWM Officer') return;

        const getOutstandingTaskCounts = () => {
            const counts = {};
            employees.forEach(emp => {
                const o2cTasks = customers.filter(c => String(c.assigned_officer_id) === String(emp.id) && c.next_service_point?.toLowerCase() === 'o2c');
                const storeTasks = customers.filter(c => (
                    c.next_service_point?.toLowerCase() === 'ewm' && (c.aa1_odn || c.aa2_odn || c.aa3_odn)
                ));
                counts[emp.id] = o2cTasks.length + storeTasks.length;
            });
            return counts;
        };

        const outstandingCounts = getOutstandingTaskCounts();
        const getUserSelectOptions = (role) => employees.filter((emp) => emp.jobTitle === role).reduce((acc, emp) => {
            const count = outstandingCounts[emp.id] || 0;
            acc[emp.id] = `${emp.full_name} (${count})`;
            return acc;
        }, {});

        let assignedOfficerIdForReturn = customer.assigned_officer_id;

        if (!assignedOfficerIdForReturn) {
            const { value: selectedUserId, isConfirmed } = await Swal.fire({
                title: 'Assign O2C Officer for return',
                input: 'select',
                inputOptions: getUserSelectOptions('O2C Officer'),
                inputPlaceholder: 'Select an O2C Officer',
                showCancelButton: true,
            });
            if (!isConfirmed) { Swal.fire('Cancelled', 'No O2C Officer assigned. Return cancelled.', 'info'); return; }
            assignedOfficerIdForReturn = selectedUserId;
        } else {
            Swal.fire('Info', `Customer will be returned to previously assigned O2C Officer: ${getAssignedUserFullName(assignedOfficerIdForReturn)}.`, 'info');
        }

        try {
            const resetData = {
                aa1_odn: null,
                aa2_odn: null,
                aa3_odn: null,
                store_id_1: null,
                store_id_2: null,
                store_id_3: null,
                store_completed_1: 'true',
                store_completed_2: 'true',
                store_completed_3: 'true',
            };

            await updateServiceStatus(
                customer,
                'started',
                null,
                assignedOfficerIdForReturn,
                'O2C',
                null,
                resetData
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
                c.next_service_point?.toLowerCase() === 'o2c' &&
                c.status !== 'o2c_completed' &&
                c.status !== 'Completed'
            );
        }
        if (jobTitle === 'Manager') {
            return customers.filter(c =>
                c.next_service_point?.toLowerCase() === 'manager' &&
                c.status?.toLowerCase() !== 'rejected' &&
                c.status?.toLowerCase() !== 'approved'
            );
        }

        const jobTitleToServicePointMap = {
            "Customer Service Officer": "customer service", "EWM Officer": "ewm", "Finance": "finance"
        };
        const normalizedJobTitle = jobTitleToServicePointMap[jobTitle] || jobTitle.toLowerCase();

        if (jobTitle === "EWM Officer") {
            const storeToCheck = normalizedUserStore.toLowerCase();
            const storeMapping = {
                'aa1': { storeIdField: 'store_id_1', odn: 'aa1_odn', completed: 'store_completed_1' },
                'aa2': { storeIdField: 'store_id_2', odn: 'aa2_odn', completed: 'store_completed_2' },
                'aa3': { storeIdField: 'store_id_3', odn: 'aa3_odn', completed: 'store_completed_3' },
            };
            const storeProps = storeMapping[storeToCheck];

            if (storeProps) {
                return customers.filter(c =>
                    c.next_service_point?.toLowerCase() === normalizedJobTitle &&
                    c[storeProps.storeIdField] === normalizedUserStore &&
                    c[storeProps.completed] !== 'true'
                );
            }
            return [];
        }

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
                            <TableCell>O2C Officer</TableCell>
                            {jobTitle !== 'EWM Officer' && <TableCell>Current Service Point</TableCell>}
                            {jobTitle !== 'EWM Officer' && <TableCell>Status</TableCell>}
                            {jobTitle === 'EWM Officer' && <TableCell>Assigned Store(s)</TableCell>}
                            {jobTitle === 'EWM Officer' && <TableCell>My ODN</TableCell>}
                            {jobTitle === 'EWM Officer' && <TableCell>Return</TableCell>}
                            <TableCell sx={{ minWidth: '220px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={jobTitle === 'EWM Officer' ? 8 : 8} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={jobTitle === 'EWM Officer' ? 8 : 8} align="center">
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
                                        <TableCell>{assignedUser}</TableCell>
                                        {jobTitle !== 'EWM Officer' && <TableCell>{customer.next_service_point || "N/A"}</TableCell>}
                                        {jobTitle !== 'EWM Officer' && (
                                            <TableCell>
                                                <Chip
                                                    label={customer.status || 'pending'}
                                                    color={customer.status === 'rejected' ? 'error' : customer.status === 'approved' ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        )}
                                        {jobTitle === 'EWM Officer' && (
                                            <TableCell>
                                                {getAssignedStoreNames(customer) || 'N/A'}
                                            </TableCell>
                                        )}
                                        {jobTitle === 'EWM Officer' && (
                                            <TableCell>
                                                {getStoreODN(customer)}
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
                                            ) : jobTitle === 'Manager' ? (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
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
                                                </Box>
                                            ) : jobTitle === 'EWM Officer' ? (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => completeStoreTask(customer)}
                                                >
                                                    Complete Task
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleComplete(customer)}
                                                    size="small"
                                                >
                                                    Complete
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
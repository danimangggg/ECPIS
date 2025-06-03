import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from 'mui-datatables';

const ViewTeamAssignedTasks = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const userPosition = localStorage.getItem('Position');   // "Coordinator" or "Manager"
  const userDept = localStorage.getItem('Department');     // e.g., "ICT"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignedRes, usersRes, tasksRes] = await Promise.all([
          axios.get('http://localhost:3001/api/viewAssignedTask'),
          axios.get('http://localhost:3001/api/users'),
          axios.get('http://localhost:3001/api/tasks')
        ]);

        const allAssignments = assignedRes.data;
        const allUsers = usersRes.data;
        const allTasks = tasksRes.data;

        let filteredAssignments = [];

        if (userPosition === 'Coordinator') {
          filteredAssignments = allAssignments.filter(assign => {
            const user = allUsers.find(
              u => String(u.id) === String(assign.userId)
            );
            return user && user.position === 'Officer' && user.department === userDept;
          });
        } else if (userPosition === 'Manager') {
          filteredAssignments = allAssignments.filter(assign => {
            const user = allUsers.find(
              u => String(u.id) === String(assign.userId)
            );
            return user && user.position === 'Coordinator';
          });
        }

        const combined = filteredAssignments.map((assign, index) => {
          const user = allUsers.find(u => String(u.id) === String(assign.userId));
          const task = allTasks.find(t => String(t.id) === String(assign.taskId));
          return {
            rollNumber: index + 1,
            fullName: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
            department: user?.department || 'Unknown',
            taskDescription: task?.description || 'N/A',
            target: assign.target || '',
            achievement: assign.achievement || ''
          };
        });

        setRows(combined);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userDept, userPosition]);

  const columns = [
    { name: 'rollNumber', label: 'Roll No.' },
    { name: 'fullName', label: 'Full Name' },
    { name: 'department', label: 'Department' },
    { name: 'taskDescription', label: 'Task Description' },
    { name: 'target', label: 'Target' },
    { name: 'achievement', label: 'Achievement' }
  ];

  const options = {
    selectableRows: 'none',
    rowsPerPage: 10,
    textLabels: {
      body: {
        noMatch: loading ? 'Loading...' : 'No tasks found.'
      }
    },
    setTableProps: () => ({
      sx: {
        '& thead th': {
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }
      }
    })
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>
        {userPosition === 'Coordinator'
          ? `Tasks Assigned to Officers in ${userDept}`
          : userPosition === 'Manager'
          ? 'Tasks Assigned to Coordinators'
          : 'No Access'}
      </h2>

      <MUIDataTable
        title=""
        data={rows}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default ViewTeamAssignedTasks;

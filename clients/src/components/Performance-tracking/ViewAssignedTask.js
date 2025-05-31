import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from 'mui-datatables';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const ViewAssignedTask = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('UserId');
  const fullName = localStorage.getItem('FullName') || 'Unknown';
  const department = localStorage.getItem('Department') || 'Unknown';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignedRes = await axios.get('http://localhost:3001/api/viewAssignedTask');
        const tasksRes = await axios.get('http://localhost:3001/api/tasks');

        const userAssigned = assignedRes.data.filter(
          (item) => String(item.userId) === userId
        );

        const combinedData = userAssigned.map((item, index) => {
          const taskDetail = tasksRes.data.find(
            (task) => String(task.id) === String(item.taskId)
          );

          return {
            rollNumber: index + 1,
            fullName,
            department,
            taskDescription: taskDetail ? taskDetail.description : 'N/A',
            target: item.target,
            achievement: item.achievement || '',
            assignedTaskId: item.id, // assuming each assignment has an ID
          };
        });

        setAssignedTasks(combinedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, fullName, department]);

  const handleAchievementChange = (value, rowIndex) => {
    const updated = [...assignedTasks];
    updated[rowIndex].achievement = value;
    setAssignedTasks(updated);
  };

  const handleSave = async (rowData) => {
    try {
      await axios.put(`/api/updateAchievement/${rowData.assignedTaskId}`, {
        achievement: rowData.achievement,
      });
      alert('Achievement updated successfully!');
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Failed to update achievement.');
    }
  };

  const columns = [
    { name: 'rollNumber', label: 'Roll Number', options: { filter: false, sort: true } },
    { name: 'fullName', label: 'Full Name', options: { filter: false, sort: false } },
    { name: 'department', label: 'Department', options: { filter: false, sort: false } },
    { name: 'taskDescription', label: 'Task Description', options: { filter: false, sort: false } },
    { name: 'target', label: 'Target', options: { filter: false, sort: false } },
    {
      name: 'achievement',
      label: 'Achievement',
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => (
          <TextField
            value={value}
            onChange={(e) =>
              handleAchievementChange(e.target.value, tableMeta.rowIndex)
            }
            size="small"
            variant="outlined"
          />
        ),
      },
    },
    {
      name: 'save',
      label: 'Save',
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const rowData = assignedTasks[dataIndex];
          return (
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={() => handleSave(rowData)}
            >
              Save
            </Button>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: 'none',
    elevation: 4,
    rowsPerPage: 10,
    textLabels: {
      body: {
        noMatch: loading ? 'Loading...' : 'Sorry, no matching records found',
      },
    },
    setTableProps: () => ({
      sx: {
        '& thead th': {
          fontWeight: 'bold',
          fontSize: '1rem',
        },
      },
    }),
  };

  return (
    <div style={{ padding: '20px' }}>
      <MUIDataTable
        title={'Assigned Tasks'}
        data={assignedTasks}
        columns={columns}
        options={options}
      />
    </div>
  );
};

export default ViewAssignedTask;

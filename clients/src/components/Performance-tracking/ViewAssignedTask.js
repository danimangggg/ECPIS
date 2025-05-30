import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

const ViewAssignedTask = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editedAchievements, setEditedAchievements] = useState({});

    const userId = localStorage.getItem('UserId');
    const userIdNumber = Number(userId);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all assigned tasks
                const assignedRes = await axios.get('http://localhost:3001/api/viewAssignedTask');
                const userAssignments = assignedRes.data.filter(assignment => assignment.userId === userIdNumber);

                const tasksRes = await axios.get('http://localhost:3001/api/tasks');
                const allTasks = tasksRes.data;

                // Combine assignment + task details
                const combinedTasks = userAssignments.map(assignment => {
                    const matchedTask = allTasks.find(task => task.id === assignment.taskId);
                    return {
                        ...assignment,
                        taskName: matchedTask?.taskName || 'Unknown Task',
                        target: matchedTask?.target || '',
                        achievement: assignment.achievement || '',
                    };
                });

                setTasks(combinedTasks);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [userIdNumber]);

    const handleAchievementChange = (taskId, value) => {
        setEditedAchievements({
            ...editedAchievements,
            [taskId]: value,
        });
    };

    const handleSave = async (task) => {
        try {
            const newAchievement = editedAchievements[task.taskId] || task.achievement;
            await axios.put(`/api/tasks/${task.taskId}/achievement`, {
                userId: task.userId,
                achievement: newAchievement,
            });

            const updatedTasks = tasks.map(t =>
                t.taskId === task.taskId ? { ...t, achievement: newAchievement } : t
            );
            setTasks(updatedTasks);
            alert('Achievement updated!');
        } catch (error) {
            console.error('Error saving achievement:', error);
            alert('Failed to update achievement.');
        }
    };

    const columns = [
        { name: 'fullName', label: 'Full Name' },
        { name: 'department', label: 'Department' },
        { name: 'taskName', label: 'Assigned Task' },
        { name: 'target', label: 'Target' },
        {
            name: 'achievement',
            label: 'Achievement',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const task = tasks[dataIndex];
                    return (
                        <TextField
                            value={editedAchievements[task.taskId] ?? task.achievement}
                            onChange={(e) => handleAchievementChange(task.taskId, e.target.value)}
                            size="small"
                        />
                    );
                }
            }
        },
        {
            name: 'save',
            label: 'Action',
            options: {
                customBodyRenderLite: (dataIndex) => {
                    const task = tasks[dataIndex];
                    return (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleSave(task)}
                        >
                            Save
                        </Button>
                    );
                }
            }
        }
    ];

    const options = {
        selectableRows: 'none',
        isRowSelectable: () => false,
    };

    if (loading) return <div>Loading tasks...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>My Assigned Tasks</h2>
            <MUIDataTable
                title={'Assigned Tasks List'}
                data={tasks}
                columns={columns}
                options={options}
            />
        </div>
    );
};

export default ViewAssignedTask;

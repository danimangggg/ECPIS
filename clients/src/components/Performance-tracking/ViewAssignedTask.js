import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

const ViewAssignedTask = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editedAchievements, setEditedAchievements] = useState({});

    const userId = localStorage.getItem('UserId');

    useEffect(() => {
        const fetchAssignedTasks = async () => {
            try {
                const res = await axios.get('/api/viewAssignedTask');
                const userAssignments = res.data.filter(assignment => assignment.userId === Number(userId));

                // Fetch task details for each assignment
                const detailedTasks = await Promise.all(
                    userAssignments.map(async (assignment) => {
                        const taskRes = await axios.get(`/api/tasks/${assignment.taskId}`);
                        return {
                            ...assignment,
                            taskName: taskRes.data.taskName,
                            target: taskRes.data.target,
                            achievement: assignment.achievement || '',
                        };
                    })
                );

                setTasks(detailedTasks);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching assigned tasks:', error);
                setLoading(false);
            }
        };

        fetchAssignedTasks();
    }, [userId]);

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

            // Update local state
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

// controller/taskAssignmentController.js
const db = require('../../models');
const TaskAssignment = db.taskassignment;

const assignTasks = async (req, res) => {
  const { assigned_by, assigned_to, tasks } = req.body;

  try {
    const created = await Promise.all(
      tasks.map(task => TaskAssignment.create({
        assigned_by,
        assigned_to,
        task_description: task.description,
      }))
    );

    res.status(200).json({ message: 'Tasks assigned successfully', data: created });
  } catch (err) {
    console.error('Error assigning tasks:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { assignTasks };

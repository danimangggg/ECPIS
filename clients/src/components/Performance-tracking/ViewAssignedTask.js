import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, CircularProgress } from "@mui/material";

const ViewAssignedTask = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState({});
  const [editedAchievements, setEditedAchievements] = useState({});
  const [achievementIds, setAchievementIds] = useState({});
  const [loading, setLoading] = useState(true);

  const loggedInUserId = localStorage.getItem("UserId");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignedRes, usersRes, tasksRes, achievementRes] = await Promise.all([
          axios.get("http://localhost:3001/api/viewAssignedTask"),
          axios.get("http://localhost:3001/api/users"),
          axios.get("http://localhost:3001/api/tasks"),
          axios.get("http://localhost:3001/api/get-achievements"),
        ]);

        const allAssignedTasks = assignedRes.data;
        const allUsers = usersRes.data;
        const allTasks = tasksRes.data;
        const allAchievements = achievementRes.data;

        const userAssignedTasks = allAssignedTasks.filter(
          (task) => String(task.userId) === loggedInUserId
        );

        const achievementMap = {};
        const achievementIdMap = {};

        allAchievements.forEach((ach) => {
          if (
            ach.savedDate === today &&
            userAssignedTasks.some((task) => task.id == ach.assignmentId) // use == to handle type coercion
          ) {
            achievementMap[ach.assignmentId] = ach.achieved;
            achievementIdMap[ach.assignmentId] = ach.id;
          }
        });

        setAssignedTasks(userAssignedTasks);
        setUsers(allUsers);
        setTasks(allTasks);
        setAchievements(achievementMap);
        setAchievementIds(achievementIdMap);

        const initEdited = {};
        userAssignedTasks.forEach((task) => {
          initEdited[task.id] = achievementMap[task.id] ?? 0;
        });
        setEditedAchievements(initEdited);

        console.log("Today's achievements:", achievementMap);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInUserId, today]);

  const getUserFullName = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user ? `${user.first_name} ${user.last_name}` : "Unknown";
  };

  const getUserDepartment = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user?.department || "Unknown";
  };

  const getTaskDescription = (taskId) => {
    const task = tasks.find((t) => String(t.id) === String(taskId));
    return task?.description || "NA";
  };

  const handleAchievementChange = (assignmentId, value) => {
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setEditedAchievements((prev) => ({
        ...prev,
        [assignmentId]: value,
      }));
    }
  };

  const handleSave = async (assignmentId) => {
    try {
      const achievedValue = Number(editedAchievements[assignmentId]) || 0;

      if (achievementIds[assignmentId]) {
        // UPDATE existing achievement
        await axios.put(`http://localhost:3001/api/update-achievement/${achievementIds[assignmentId]}`, {
          achieved: achievedValue,
        });
      } else {
        // CREATE new achievement
        const res = await axios.post("http://localhost:3001/api/add-achievement", {
          assignmentId,
          achieved: achievedValue,
          date: today,
        });

        // Save new achievement ID
        setAchievementIds((prev) => ({
          ...prev,
          [assignmentId]: res.data.id,
        }));
      }

      alert("Saved successfully");

      setAchievements((prev) => ({
        ...prev,
        [assignmentId]: achievedValue,
      }));
    } catch (error) {
      console.error("Save failed:", error.response || error.message || error);
      alert("Save failed");
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (assignedTasks.length === 0) {
    return (
      <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
        No assigned tasks found.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Assigned Tasks for {getUserFullName(loggedInUserId)} - {getUserDepartment(loggedInUserId)}
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Date: {today}
      </Typography>

      <Box sx={{ height: 500, width: "100%" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "1.1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#ddd" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>#</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Task Description</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Target</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Achievement</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedTasks.map((task, index) => (
              <tr key={task.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px", width: 50 }}>{index + 1}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{getTaskDescription(task.taskId)}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px", width: 100 }}>{task.target}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px", width: 120 }}>
                  <TextField
                    type="text"
                    value={editedAchievements[task.id] ?? 0}
                    onChange={(e) => handleAchievementChange(task.id, e.target.value)}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    variant="outlined"
                    size="small"
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", width: 120 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleSave(task.id)}
                    size="small"
                  >
                    Save
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default ViewAssignedTask;

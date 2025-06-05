import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const ViewAssignedTask = () => {
  // State variables for storing fetched data and UI interactions
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [achievements, setAchievements] = useState({}); // Stores today's achievements for display
  const [editedAchievements, setEditedAchievements] = useState({}); // Stores values typed into achievement text fields
  const [loading, setLoading] = useState(true); // Manages loading state for data fetching

  // State for Snackbar (custom alert message)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // New state for AI feedback messages and their loading status
  const [feedbackMessages, setFeedbackMessages] = useState({}); // Stores AI feedback by assignmentId
  const [feedbackLoading, setFeedbackLoading] = useState({}); // Tracks loading state for AI feedback
  const [expandedFeedback, setExpandedFeedback] = useState({}); // Tracks which feedback sections are expanded

  // Retrieve logged-in user ID from local storage
  const loggedInUserId = localStorage.getItem("UserId");

  // Get today's date in ISO format (YYYY-MM-DD) for consistent comparison
  const today = new Date().toISOString().slice(0, 10);

  // useEffect hook to fetch data when the component mounts or dependencies change
  useEffect(() => {
    const fetchData = async () => {
      console.log("--- Starting Data Fetch ---");
      console.log("Logged In User ID from localStorage:", loggedInUserId);
      console.log("Today's Date (Frontend):", today);

      try {
        // Fetch all necessary data concurrently using Promise.all
        const [assignedRes, usersRes, tasksRes, achievementRes] = await Promise.all([
          axios.get("http://localhost:3001/api/viewAssignedTask"),
          axios.get("http://localhost:3001/api/users"),
          axios.get("http://localhost:3001/api/tasks"),
          axios.get("http://localhost:3001/api/get-achievements"), // Fetch ALL achievements
        ]);

        const allAssignedTasks = assignedRes.data;
        const allUsers = usersRes.data;
        const allTasks = tasksRes.data;
        const allAchievements = achievementRes.data;

        console.log("API Response - All Assigned Tasks:", allAssignedTasks);
        console.log("API Response - All Users:", allUsers);
        console.log("API Response - All Tasks:", allTasks);
        console.log("API Response - All Achievements:", allAchievements);

        // Filter assigned tasks to show only those for the logged-in user
        const userAssignedTasks = allAssignedTasks.filter(
          (task) => String(task.userId) === loggedInUserId
        );
        console.log("Filtered Assigned Tasks for current user:", userAssignedTasks);

        // Create a map of today's achievements, keyed by assignmentId
        // This ensures we only consider achievements recorded for the current day
        const achievementMap = {};
        allAchievements.forEach((ach) => {
          // Normalize the achievement date to INSEE-MM-DD for accurate comparison
          // Using ach.savedDate as per the Sequelize model
          const achievementDate = String(ach.savedDate).slice(0, 10);
          if (achievementDate === today) {
            achievementMap[ach.assignmentId] = ach.achieved;
            console.log(`Debug: Processing achievement for assignmentId: ${ach.assignmentId}, savedDate: ${ach.savedDate}, achieved: ${ach.achieved}`);
          }
        });

        console.log("Achievement Map (only for today's date):", achievementMap);

        // Initialize the `editedAchievements` state for the input fields
        // This populates the text fields with today's existing achievements or defaults to empty string
        const initEdited = {};
        userAssignedTasks.forEach((task) => {
          // If achievementMap has an entry for this task's ID, use its value, otherwise use an empty string
          // Ensure task.id is consistently compared (string conversion)
          const achievementValue = achievementMap[String(task.id)] !== undefined ? Number(achievementMap[String(task.id)]) : '';
          initEdited[task.id] = achievementValue;
          console.log(`Debug: Initializing TextField for task.id: ${task.id}, with value: ${achievementValue} (from achievementMap[${String(task.id)}] = ${achievementMap[String(task.id)]})`);
        });
        setEditedAchievements(initEdited);
        console.log("Initialized Edited Achievements (for TextField values):", initEdited);

        setLoading(false); // Set loading to false once data is fetched
        console.log("--- Data Fetch Complete ---");
      } catch (error) {
        console.error("Fetch error:", error);
        setSnackbarMessage("Failed to fetch data.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
        console.log("--- Data Fetch Failed ---");
      }
    };

    // Only attempt to fetch data if a loggedInUserId is available
    if (loggedInUserId) {
      fetchData();
    } else {
      setSnackbarMessage("User ID not found in local storage. Please log in.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      setLoading(false);
      console.log("No Logged In User ID found, skipping data fetch.");
    }
  }, [loggedInUserId, today]);

  // Helper function to get a user's full name by their ID
  const getUserFullName = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user ? `${user.first_name} ${user.last_name}` : "Unknown";
  };

  // Helper function to get a user's department by their ID
  const getUserDepartment = (userId) => {
    const user = users.find((u) => String(u.id) === String(userId));
    return user ? user.department || "Unknown" : "Unknown";
  };

  // Helper function to get a task description by its ID
  const getTaskDescription = (taskId) => {
    const task = tasks.find((t) => String(t.id) === String(taskId));
    return task ? task.description || "NA" : "NA";
  };

  // Handler for changes in the achievement input field
  const handleAchievementChange = (assignmentId, value) => {
    // Allow empty string or numeric input only
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setEditedAchievements((prev) => ({
        ...prev,
        [assignmentId]: value,
      }));
    }
  };

  // Handler to save or update an achievement
  const handleSave = async (assignmentId) => {
    try {
      const achievedValue = Number(editedAchievements[assignmentId]) || 0;

      // Note: Assuming your backend's /api/add-achievement endpoint expects a 'date' field
      // which it then maps to the 'savedDate' in your database model.
      await axios.post("http://localhost:3001/api/add-achievement", {
        assignmentId,
        achieved: achievedValue,
        date: today,
      });

      setSnackbarMessage("Saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Immediately update the local `achievements` state and `editedAchievements`
      setAchievements((prev) => ({
        ...prev,
        [assignmentId]: achievedValue,
      }));
      setEditedAchievements((prev) => ({
        ...prev,
        [assignmentId]: achievedValue,
      }));

    } catch (error) {
      console.error("Save failed:", error.response || error.message || error);
      setSnackbarMessage("Save failed: " + (error.response?.data?.message || error.message || "Unknown error"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handler for AI Feedback generation
  const handleGetFeedback = async (assignmentId, target, achieved) => {
    setFeedbackLoading((prev) => ({ ...prev, [assignmentId]: true }));
    setFeedbackMessages((prev) => ({ ...prev, [assignmentId]: '' })); // Clear previous feedback

    try {
      const prompt = `You are a helpful assistant for task management. A user has a task with a target of ${target} units and has achieved ${achieved} units today. Provide concise and encouraging feedback. If the achievement is less than the target, suggest a positive next step or encouragement. If it meets or exceeds the target, offer congratulations. Keep it to 1-2 sentences.`;

      const apiKey = ""; // This will be provided by the Canvas environment at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 100
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const feedback = result.candidates[0].content.parts[0].text;
        setFeedbackMessages((prev) => ({ ...prev, [assignmentId]: feedback }));
        setExpandedFeedback((prev) => ({ ...prev, [assignmentId]: true }));
      } else {
        setSnackbarMessage("Failed to generate AI feedback: No candidates found.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setFeedbackMessages((prev) => ({ ...prev, [assignmentId]: 'Could not generate feedback.' }));
      }
    } catch (error) {
      console.error("AI Feedback generation failed:", error);
      setSnackbarMessage("Error generating AI feedback: " + (error.message || "Unknown error"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setFeedbackMessages((prev) => ({ ...prev, [assignmentId]: 'Error generating feedback.' }));
    } finally {
      setFeedbackLoading((prev) => ({ ...prev, [assignmentId]: false }));
    }
  };

  // Handler to toggle feedback section expansion
  const handleToggleFeedback = (assignmentId) => {
    setExpandedFeedback((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }));
  };

  // Handler to close the Snackbar message
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Display a loading spinner while data is being fetched
  if (loading) {
    return (
      <Box className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <CircularProgress className="text-blue-600" size={60} thickness={4} />
      </Box>
    );
  }

  // Display a message if no assigned tasks are found for the user
  if (assignedTasks.length === 0) {
    return (
      <Typography variant="h6" className="mt-8 text-center text-gray-700 p-6 bg-white rounded-xl shadow-2xl mx-auto max-w-lg animate-fade-in">
        No assigned tasks found for today. Get started by assigning some tasks!
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} elevation={6} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Typography>
    );
  }

  // Main component render
  return (
    // Outer container with responsive padding, font, and background
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 md:p-8 font-sans">
      <Box className="container mx-auto bg-white rounded-3xl shadow-3xl p-6 sm:p-8 md:p-10 my-8">

        {/* Header Section */}
        <Box className="mb-10 p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl shadow-xl text-center transform transition-all duration-300 hover:scale-105">
          <Typography variant="h3" className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Daily Task Tracker
          </Typography>
          <Typography variant="h5" className="text-xl md:text-2xl font-light opacity-95">
            for <span className="font-semibold">{getUserFullName(loggedInUserId)}</span> (Dept: {getUserDepartment(loggedInUserId)})
          </Typography>
          <Typography variant="subtitle1" className="text-base md:text-lg mt-3 font-medium opacity-80">
            Today: <span className="font-bold text-yellow-300">{today}</span>
          </Typography>
        </Box>

        {/* Table Container */}
        <Box className="overflow-x-auto shadow-2xl rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-base text-gray-700 border-collapse"> {/* Added border-collapse */}
            {/* Table Header */}
            <thead className="text-sm text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-md"> {/* Stronger shadow */}
              <tr>
                <th scope="col" className="py-5 px-7 border-b-2 border-gray-300 border-r-2 border-gray-300 rounded-tl-xl font-bold text-gray-800">#</th> {/* Thicker borders */}
                <th scope="col" className="py-5 px-7 border-b-2 border-gray-300 border-r-2 border-gray-300 font-bold text-gray-800">Task Description</th>
                <th scope="col" className="py-5 px-7 border-b-2 border-gray-300 border-r-2 border-gray-300 font-bold text-gray-800">Target</th>
                <th scope="col" className="py-5 px-7 border-b-2 border-gray-300 border-r-2 border-gray-300 font-bold text-gray-800">Achievement</th>
                <th scope="col" className="py-5 px-7 border-b-2 border-gray-300 rounded-tr-xl font-bold text-gray-800">Action</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {assignedTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr className={`border-b-2 border-gray-200 transition duration-200 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}> {/* Alternating row colors, thicker row border */}
                    <td className="py-5 px-7 font-medium text-gray-900 whitespace-nowrap border-r-2 border-gray-200">{index + 1}</td> {/* Thicker borders */}
                    <td className="py-5 px-7 text-base border-r-2 border-gray-200">{getTaskDescription(task.taskId)}</td>
                    <td className="py-5 px-7 font-bold text-green-600 border-r-2 border-gray-200">{task.target}</td>
                    <td className="py-5 px-7 border-r-2 border-gray-200">
                      {/* Achievement input field */}
                      <TextField
                        type="text"
                        value={editedAchievements[task.id] !== undefined ? editedAchievements[task.id] : ''}
                        onChange={(e) => handleAchievementChange(task.id, e.target.value)}
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        variant="outlined"
                        size="small"
                        className="w-32 md:w-40 rounded-md shadow-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6', // Blue-500
                              borderWidth: '2px',
                            },
                          },
                        }}
                      />
                    </td>
                    <td className="py-5 px-7 space-y-2 sm:space-y-0 sm:space-x-3 flex flex-col sm:flex-row items-start sm:items-center"> {/* Increased space-x */}
                      {/* Save button */}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSave(task.id)}
                        size="small"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transform hover:-translate-y-0.5"
                      >
                        Save
                      </Button>
                      {/* AI Feedback Button */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleGetFeedback(task.id, task.target, Number(editedAchievements[task.id]) || 0)}
                        size="small"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transform hover:-translate-y-0.5"
                        disabled={feedbackLoading[task.id]}
                      >
                        {feedbackLoading[task.id] ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          '✨ Get Feedback'
                        )}
                      </Button>
                    </td>
                  </tr>
                  {/* AI Feedback Row */}
                  <tr className={`border-b-2 border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}> {/* Alternating row colors for feedback section */}
                    <td colSpan="5" className="py-3 px-7">
                      <Box className="flex flex-col">
                        <Box
                          className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition duration-150"
                          onClick={() => handleToggleFeedback(task.id)}
                        >
                          <Typography variant="body2" className="font-bold text-gray-700">AI Feedback</Typography>
                          {feedbackMessages[task.id] && (
                            <IconButton size="small" className="text-gray-500 hover:text-blue-600">
                              {expandedFeedback[task.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                        </Box>
                        <Collapse in={expandedFeedback[task.id]} timeout="auto" unmountOnExit>
                          <Box className="mt-2 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm border border-blue-200 shadow-inner">
                            {feedbackMessages[task.id] ? (
                              <Typography variant="body2" className="leading-relaxed text-gray-800">
                                {feedbackMessages[task.id]}
                              </Typography>
                            ) : (
                              !feedbackLoading[task.id] && <Typography variant="body2" className="text-gray-500 italic">Click "✨ Get Feedback" to generate feedback for this task.</Typography>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Box>

        {/* Snackbar component for displaying messages */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} elevation={6} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ViewAssignedTask;

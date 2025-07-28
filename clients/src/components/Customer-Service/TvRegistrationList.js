import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';

const CustomerRegistrationList = () => {
  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));

  const lastCallTimes = useRef(new Map());
  const ANNOUNCEMENT_REPEAT_INTERVAL_MS = 3 * 1000; // Re-announce every 3 seconds if status is still 'notifying'

  // Ref to hold the speech synthesis object and a queue
  const speechRef = useRef({
    speaker: null,
    utterance: null,
    queue: [], // Array of customer IDs to announce
    isSpeaking: false,
    init: false // Flag to ensure initialization only happens once
  });

  const api_url = process.env.REACT_APP_API_URL;

  // --- Initialize SpeechSynthesis API (run once) ---
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn("Web Speech API is not supported in this browser. Voice announcements will not work.");
      return;
    }

    if (speechRef.current.init) return; // Already initialized

    const speaker = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();

    // --- REINSTATED: Logic to find and use Amharic voice ---
    const desiredLang = 'am-ET'; // Amharic language code

    const setAmharicVoice = () => {
        const voices = speaker.getVoices();
        const amharicVoice = voices.find(voice => voice.lang === desiredLang);

        if (amharicVoice) {
            utterance.voice = amharicVoice;
            utterance.lang = desiredLang; // Set lang too, as it's good practice
            console.log(`Amharic voice found and set: "${amharicVoice.name}" (${amharicVoice.lang})`);
        } else {
            // No specific Amharic voice found. Set lang and hope for browser's best effort.
            utterance.lang = desiredLang; // Still set lang, browser might try best effort
            console.warn(`No specific Amharic voice (${desiredLang}) found in this browser.`);
            console.warn("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
            console.warn("Speech might default to another language or fail.");
            console.warn("To enable Amharic voice, you might need to install a language pack on your operating system or adjust browser speech settings.");
        }
    };

    // Listen for voices to be loaded (can happen asynchronously)
    speaker.onvoiceschanged = setAmharicVoice;

    // Also try to set it immediately if voices are already loaded
    if (speaker.getVoices().length > 0) {
        setAmharicVoice();
    }
    // --- END REINSTATED LOGIC ---


    // Event listeners for debugging and sequencing
    utterance.onstart = () => {
      speechRef.current.isSpeaking = true;
      console.log('Speech started for:', utterance.text);
    };
    utterance.onend = () => {
      speechRef.current.isSpeaking = false;
      console.log('Speech ended for:', utterance.text);
      // Speak next in queue if available
      if (speechRef.current.processSpeechQueue) {
          speechRef.current.processSpeechQueue();
      }
    };
    utterance.onerror = (event) => {
      speechRef.current.isSpeaking = false;
      console.error('Speech synthesis error:', event.error);
      // Attempt to process next in queue even on error
      if (speechRef.current.processSpeechQueue) {
          speechRef.current.processSpeechQueue();
      }
    };
    utterance.onpause = () => console.log('Speech paused for:', utterance.text);
    utterance.onresume = () => console.log('Speech resumed for:', utterance.text);

    speechRef.current.speaker = speaker;
    speechRef.current.utterance = utterance;
    speechRef.current.init = true;

    // Function to process the queue
    const processSpeechQueue = () => {
      if (!speechRef.current.speaker || !speechRef.current.utterance) {
          console.warn("Speech API not fully initialized for queue processing.");
          return;
      }
      if (speechRef.current.queue.length > 0 && !speechRef.current.isSpeaking) {
        const nextIdToSpeak = speechRef.current.queue.shift(); // Get next ID from queue
        speechRef.current.utterance.text = String(nextIdToSpeak);
        console.log(`--- Speaking from queue: "${speechRef.current.utterance.text}" ---`);
        speechRef.current.speaker.speak(speechRef.current.utterance);
      } else if (speechRef.current.queue.length === 0) {
        console.log("Speech queue is empty.");
      }
    };

    // Store the processing function in ref so it can be called elsewhere
    speechRef.current.processSpeechQueue = processSpeechQueue;

    // Cleanup for unmount
    return () => {
      console.log("Cleanup: Unmounting. Cancelling all speech.");
      if (speaker.speaking) {
        speaker.cancel();
      }
      // Clear all listeners explicitly to avoid memory leaks
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onpause = null;
      utterance.onresume = null;
      speaker.onvoiceschanged = null; // Clear this listener too
      speechRef.current.init = false;
      speechRef.current.speaker = null;
      speechRef.current.utterance = null;
      speechRef.current.queue = [];
      speechRef.current.isSpeaking = false;
      speechRef.current.processSpeechQueue = null;
    };
  }, []); // Empty dependency array means this runs only once on mount


  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, facRes, empRes] = await Promise.all([
          axios.get(`${api_url}/api/serviceList`),
          axios.get(`${api_url}/api/facilities`),
          axios.get(`${api_url}/api/get-employee`)
        ]);
        setCustomers(custRes.data);
        setFacilities(facRes.data);
        setEmployees(empRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Fetch data every 3 seconds
    return () => clearInterval(interval);
  }, [api_url]);

  // --- Real-time Clock Update ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('dddd, MMMM D, YYYY — hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Helper Functions ---
  const getFacility = (id) => facilities.find((f) => f.id === id);
  const getOfficerName = (officerId) => {
    const user = employees.find(u => u.id === officerId);
    return user ? user.full_name : 'N/A';
  };

  const getDisplayStatus = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'started') {
      return 'Waiting';
    } else if (lowerStatus === 'notifying') {
      return 'Calling';
    } else if (lowerStatus === 'o2c_started') {
      return 'In Progress';
    }
    return status || 'N/A';
  };

  // --- Filtering Customers for Display ---
  const today = dayjs().startOf('day');
  const filteredCustomers = customers
    .filter(cust => {
      const status = cust.status?.toLowerCase();
      const nextServicePoint = cust.next_service_point?.toLowerCase();
      return (
        (status === 'started' || status === 'notifying' || status === 'o2c_started') &&
        nextServicePoint === 'o2c' &&
        dayjs(cust.started_at).isAfter(today)
      );
    })
    .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

  // --- Voice Announcement Queueing Logic ---
  useEffect(() => {
    if (!speechRef.current.init) {
      console.warn("Speech synthesis not initialized yet.");
      return;
    }

    const now = Date.now();

    const currentNotifyingCustomers = filteredCustomers.filter(
      c => c.status?.toLowerCase() === 'notifying'
    );
    const currentNotifyingIds = new Set(currentNotifyingCustomers.map(c => c.id));

    // --- Step 1: Clean up lastCallTimes for customers no longer notifying ---
    for (let customerId of lastCallTimes.current.keys()) {
      if (!currentNotifyingIds.has(customerId)) {
        console.log(`Cleaning up lastCallTimes: Customer ID ${customerId} is no longer notifying.`);
        lastCallTimes.current.delete(customerId);
      }
    }

    // --- Step 2: Ensure the queue only contains IDs that are *still* notifying ---
    speechRef.current.queue = speechRef.current.queue.filter(queuedId => currentNotifyingIds.has(queuedId));


    // --- Step 3: Add new or re-announceable customers to the speech queue ---
    currentNotifyingCustomers.forEach(cust => {
      const lastCalled = lastCallTimes.current.get(cust.id);
      const shouldAnnounce = !lastCalled || (now - lastCalled > ANNOUNCEMENT_REPEAT_INTERVAL_MS);

      // Only add if shouldAnnounce and not already in the queue (after filtering in step 2)
      if (shouldAnnounce && !speechRef.current.queue.includes(cust.id)) {
        console.log(`Adding Customer ID ${cust.id} to speech queue.`);
        speechRef.current.queue.push(cust.id);
        lastCallTimes.current.set(cust.id, now); // Update last called time immediately upon queuing
      }
    });

    // --- Step 4: Process the queue ---
    if (speechRef.current.processSpeechQueue) {
      speechRef.current.processSpeechQueue();
    }

  }, [filteredCustomers]);


  // --- Loading State ---
  if (loading) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  // --- Rendered Component ---
  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#141E30',
        color: '#fff',
        p: 4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          top: 20,
          right: 30,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#00e5ff',
        }}
      >
        {currentTime}
      </Typography>

      <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold', color: '#00e5ff' }}>
        Live Progress Follow-up
      </Typography>

      {filteredCustomers.length === 0 ? (
        <Typography variant="h5" sx={{ mt: 10 }}>
          No customers at O2C service point currently in progress.
        </Typography>
      ) : (
        <Box
          sx={{
            height: '75vh',
            width: '90vw',
            maxWidth: 1300,
            position: 'relative',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 3,
            p: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            className="scroll-wrapper"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              animation: `slideUp ${filteredCustomers.length * 6}s linear infinite`,
            }}
          >
            {[...filteredCustomers, ...filteredCustomers].map((cust, index) => {
              const facility = getFacility(cust.facility_id);
              const isNotifying = cust.status?.toLowerCase() === 'notifying';

              return (
                <Box
                  key={`${cust.id}-${index}`}
                  className={isNotifying ? 'zoom-container' : ''}
                  sx={{
                    backgroundColor: isNotifying ? '#FFFACD' : '#1e1e1e', // Vibrant background
                    borderRadius: 3,
                    padding: 2,
                    boxShadow: '0 0 15px #00e5ff',
                    minHeight: 100,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 4,
                    animation: isNotifying ? 'zoomPulse 1.5s infinite alternate' : 'none',
                  }}
                >
                  <Typography variant="h5" sx={{ color: isNotifying ? '#333333' : '#00e5ff', width: '10%' }}>
                    {cust.id}
                  </Typography>
                  <Typography variant="h6" sx={{ color: isNotifying ? '#333333' : '#fff', width: '30%' }}>
                    Facility: {facility?.facility_name || 'N/A'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: isNotifying ? '#333333' : '#fff', width: '40%' }}>
                    Assigned Officer: {getOfficerName(cust.assigned_officer_id)}
                  </Typography>
                  <Typography variant="h6" sx={{ color: isNotifying ? '#8B0000' : '#76ff03', width: '20%' }}>
                    Status: {getDisplayStatus(cust.status)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      <style>
        {`
          @keyframes slideUp {
            0% {
              transform: translateY(0%);
            }
            100% {
              transform: translateY(-50%);
            }
          }

          @keyframes zoomPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 15px #FFD700; /* Vibrant Gold/Yellow */
            }
            50% {
              transform: scale(1.03); /* Slightly larger */
              box-shadow: 0 0 25px 5px #FFD700; /* More prominent, vibrant shadow */
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 15px #FFD700; /* Vibrant Gold/Yellow */
            }
          }

          /* New animation for text within the pulsing box */
          .zoom-container .MuiTypography-root {
            animation: textZoom 1.5s infinite alternate;
          }

          @keyframes textZoom {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05); /* Text zooms slightly more than the box */
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CustomerRegistrationList;
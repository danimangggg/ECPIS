import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, MenuItem, TextField, Box } from '@mui/material';

const RegisterCustomer = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/facilities').then(res => {
      setFacilities(res.data);
    });
  }, []);

  const handleRegister = () => {
    axios.post('http://localhost:3001/api/customer-queue/register', {
      facility_id: selectedFacility
    }).then(() => {
      alert('Customer registered!');
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <TextField
        select
        label="Select Facility"
        value={selectedFacility}
        onChange={e => setSelectedFacility(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {facilities.map(fac => (
          <MenuItem key={fac.id} value={fac.id}>
            {fac.facility_name}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" onClick={handleRegister}>
        Register Customer
      </Button>
    </Box>
  );
};

export default RegisterCustomer;

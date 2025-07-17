import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import axios from 'axios';

const RegisterCustomer = () => {
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [officers, setOfficers] = useState([]);  
  const api_url = process.env.REACT_APP_API_URL;

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedWoreda, setSelectedWoreda] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');

  const [firstServicePoint, setFirstServicePoint] = useState('');
  const [processStatus, setProcessStatus] = useState('onprogress');

  // Load regions
  useEffect(() => {
    axios.get(`${api_url}/api/regions`).then(res => setRegions(res.data));
  }, []);

  // Load zones when region changes
  useEffect(() => {
    if (selectedRegion) {
      axios.get(`${api_url}/api/zones?region_id=${selectedRegion}`).then(res => setZones(res.data));
    }
  }, [selectedRegion]);

  // Load woredas when zone changes
  useEffect(() => {
    if (selectedZone) {
      axios.get(`${api_url}/api/woredas?zone_id=${selectedZone}`).then(res => setWoredas(res.data));
    }
  }, [selectedZone]);

  // Load facilities when woreda changes
  useEffect(() => {
    if (selectedWoreda) {
      axios.get(`${api_url}/api/facilities?woreda_id=${selectedWoreda}`).then(res => setFacilities(res.data));
    }
  }, [selectedWoreda]);

  // Determine service point and load officers if needed
  useEffect(() => {
    if (customerType === 'Cash') {
      setFirstServicePoint('O2C');
      axios.get(`${api_url}/api/employees?department=O2C`).then(res => setOfficers(res.data));
    } else if (customerType === 'Credit') {
      setFirstServicePoint('Finance');
      setOfficers([]); // Not needed for Credit initially
    } else {
      setFirstServicePoint('');
    }
  }, [customerType]);

  const handleSubmit = () => {
    const payload = {
      facility_id: selectedFacility,
      customer_type: customerType,
      current_service_point: firstServicePoint,
      assigned_officer_id: customerType === 'Cash' ? selectedOfficer : null,
      status: processStatus,
    };

    axios.post(`${api_url}/api/customer-queue`, payload).then(res => {
      alert('Customer registered and sent to service point!');
      // Reset form
      setSelectedRegion('');
      setSelectedZone('');
      setSelectedWoreda('');
      setSelectedFacility('');
      setCustomerType('');
      setSelectedOfficer('');
      setFirstServicePoint('');
    });
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Customer Registration
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField select fullWidth label="Region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            {regions.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.region_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField select fullWidth label="Zone" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
            {zones.map(z => (
              <MenuItem key={z.id} value={z.id}>{z.zone_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField select fullWidth label="Woreda" value={selectedWoreda} onChange={e => setSelectedWoreda(e.target.value)}>
            {woredas.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.woreda_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField select fullWidth label="Facility" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
            {facilities.map(f => (
              <MenuItem key={f.id} value={f.id}>{f.facility_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField select fullWidth label="Customer Type" value={customerType} onChange={e => setCustomerType(e.target.value)}>
            <MenuItem value="Cash">Cash Sale</MenuItem>
            <MenuItem value="Credit">Credit Sale</MenuItem>
          </TextField>
        </Grid>

        {customerType === 'Cash' && (
          <Grid item xs={12}>
            <TextField select fullWidth label="Assign Officer" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
              {officers.map(officer => (
                <MenuItem key={officer.id} value={officer.id}>
                  {officer.first_name} {officer.last_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
            Register and Forward to {firstServicePoint}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterCustomer;

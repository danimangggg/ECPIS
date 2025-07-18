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

const api_url = process.env.REACT_APP_API_URL;

const RegisterCustomer = () => {
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);

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

  // Load zones based on selected region_name
  useEffect(() => {
    if (selectedRegion) {
      axios.get(`${api_url}/api/zones`).then(res => {
        const filtered = res.data.filter(zone => zone.region_name === selectedRegion);
        setZones(filtered);
        setWoredas([]); // Reset dependent dropdowns
        setFacilities([]);
        setSelectedZone('');
        setSelectedWoreda('');
        setSelectedFacility('');
      });
    }
  }, [selectedRegion]);

  // Load woredas based on selected zone_name
  useEffect(() => {
    if (selectedZone) {
      axios.get(`${api_url}/api/woredas`).then(res => {
        const filtered = res.data.filter(woreda => woreda.zone_name === selectedZone);
        setWoredas(filtered);
        setFacilities([]);
        setSelectedWoreda('');
        setSelectedFacility('');
      });
    }
  }, [selectedZone]);

  // Load facilities based on selected woreda_name
  useEffect(() => {
    if (selectedWoreda) {
      axios.get(`${api_url}/api/facilities`).then(res => {
        const filtered = res.data.filter(facility => facility.woreda_name === selectedWoreda);
        setFacilities(filtered);
        setSelectedFacility('');
      });
    }
  }, [selectedWoreda]);

  // Fetch all officers once on mount
  useEffect(() => {
    axios.get(`${api_url}/api/get-employee`)
      .then(res => setOfficers(res.data))
      .catch(err => console.error('Failed to fetch officers:', err));
  }, []);

  // Filter officers client-side based on customerType and set firstServicePoint
  useEffect(() => {
    if (customerType === 'Cash') {
      setFirstServicePoint('O2C Officer');
      setFilteredOfficers(officers.filter(o => o.jobTitle === 'O2C Officer'));
    } else if (customerType === 'Credit') {
      setFirstServicePoint('Finance');
      setFilteredOfficers([]);
    } else {
      setFirstServicePoint('');
      setFilteredOfficers([]);
    }
  }, [customerType, officers]);

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
        {/* Region Dropdown */}
        <Grid item xs={12}>
          <TextField select fullWidth label="Region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            {regions.map(r => (
              <MenuItem key={r.id} value={r.region_name}>{r.region_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Zone Dropdown */}
        <Grid item xs={12}>
          <TextField select fullWidth label="Zone" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
            {zones.map(z => (
              <MenuItem key={z.id} value={z.zone_name}>{z.zone_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Woreda Dropdown */}
        <Grid item xs={12}>
          <TextField select fullWidth label="Woreda" value={selectedWoreda} onChange={e => setSelectedWoreda(e.target.value)}>
            {woredas.map(w => (
              <MenuItem key={w.id} value={w.woreda_name}>{w.woreda_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Facility Dropdown */}
        <Grid item xs={12}>
          <TextField select fullWidth label="Facility" value={selectedFacility} onChange={e => setSelectedFacility(e.target.value)}>
            {facilities.map(f => (
              <MenuItem key={f.id} value={f.id}>{f.facility_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Customer Type Dropdown */}
        <Grid item xs={12}>
          <TextField select fullWidth label="Customer Type" value={customerType} onChange={e => setCustomerType(e.target.value)}>
            <MenuItem value="Cash">Cash Sale</MenuItem>
            <MenuItem value="Credit">Credit Sale</MenuItem>
          </TextField>
        </Grid>

        {/* Officer Assignment Dropdown */}
        {customerType === 'Cash' && (
          <Grid item xs={12}>
            <TextField select fullWidth label="Assign Officer" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
              {filteredOfficers.map(officer => (
                <MenuItem key={officer.id} value={officer.id}>
                  {officer.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Submit Button */}
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

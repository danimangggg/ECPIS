import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

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
  const [nextServicePoint, setNextServicePoint] = useState('');
  const [startedAt, setStartedAt] = useState('');

  useEffect(() => {
    axios.get(`${api_url}/api/regions`).then(res => setRegions(res.data));
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      axios.get(`${api_url}/api/zones`).then(res => {
        const filtered = res.data.filter(z => z.region_name === selectedRegion);
        setZones(filtered);
        setSelectedZone('');
        setSelectedWoreda('');
        setSelectedFacility('');
        setWoredas([]);
        setFacilities([]);
      });
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedZone) {
      axios.get(`${api_url}/api/woredas`).then(res => {
        const filtered = res.data.filter(w => w.zone_name === selectedZone);
        setWoredas(filtered);
        setSelectedWoreda('');
        setSelectedFacility('');
        setFacilities([]);
      });
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedWoreda) {
      axios.get(`${api_url}/api/facilities`).then(res => {
        const filtered = res.data.filter(f => f.woreda_name === selectedWoreda);
        setFacilities(filtered);
        setSelectedFacility('');
      });
    }
  }, [selectedWoreda]);

  useEffect(() => {
    axios.get(`${api_url}/api/get-employee`)
      .then(res => setOfficers(res.data))
      .catch(err => console.error('Failed to fetch officers:', err));
  }, []);

  useEffect(() => {
    if (customerType === 'Cash') {
      setFirstServicePoint('O2C Officer');
      setNextServicePoint('O2C');
      const filtered = officers.filter(o => o.jobTitle === 'O2C Officer');
      setFilteredOfficers(filtered);
    } else if (customerType === 'Credit') {
      setFirstServicePoint('Finance');
      setNextServicePoint('Finance');
      setFilteredOfficers([]);
      setSelectedOfficer('');
    } else {
      setFirstServicePoint('');
      setNextServicePoint('');
      setFilteredOfficers([]);
      setSelectedOfficer('');
    }
  }, [customerType, officers]);

  const handleSubmit = () => {
    const now = new Date().toISOString();
    setStartedAt(now);

    const payload = {
      facility_id: selectedFacility,
      customer_type: customerType,
      current_service_point: firstServicePoint,
      next_service_point: nextServicePoint,
      assigned_officer_id: customerType === 'Cash' ? selectedOfficer : null,
      status: 'started',
      started_at: now,
    };

    axios.post(`${api_url}/api/customer-queue`, payload).then(res => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Customer registered and sent to service point.',
        confirmButtonColor: '#1976d2'
      });

      setSelectedRegion('');
      setSelectedZone('');
      setSelectedWoreda('');
      setSelectedFacility('');
      setCustomerType('');
      setSelectedOfficer('');
      setFirstServicePoint('');
      setNextServicePoint('');
    });
  };

  return (
    <Box sx={{ py: 6, px: 2, fontFamily: 'Roboto' }}>
      <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight={600} gutterBottom>
          Register Customer
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField select fullWidth label="Region" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
              {regions.map(r => (
                <MenuItem key={r.id} value={r.region_name}>{r.region_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField select fullWidth label="Zone" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
              {zones.map(z => (
                <MenuItem key={z.id} value={z.zone_name}>{z.zone_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField select fullWidth label="Woreda" value={selectedWoreda} onChange={e => setSelectedWoreda(e.target.value)}>
              {woredas.map(w => (
                <MenuItem key={w.id} value={w.woreda_name}>{w.woreda_name}</MenuItem>
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
                {filteredOfficers.map(officer => (
                  <MenuItem key={officer.id} value={officer.id}>
                    {officer.full_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} size="large">
              Register & Forward to {firstServicePoint || 'Service Point'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RegisterCustomer;

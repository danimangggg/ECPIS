import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Grid } from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styled } from '@mui/material/styles';

const api_url = process.env.REACT_APP_API_URL;

const StyledForm = styled('form')(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const AddPod = () => {
  const [file, setFile] = useState();
  const [date, setDate] = useState(new Date());
  const [region, setRegion] = useState('');
  const [zone_Subcity, setZone_Subcity] = useState('');
  const [woreda, setWoreda] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [dnNo, setDnNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [podNo, setPodNo] = useState('');
  const [manualDeliveryNo, setManualDeliveryNo] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [infoRegion, setData] = useState([]);
  const [infoZone, setZone] = useState([]);
  const [infoWoreda, setInfoWoreda] = useState([]);
  const [infoFacility, setInfoFacility] = useState([]);
  const [infoPodReceiver, setInfoPodReceiver] = useState([]);

  const submitUploaded = async (e) => {
    e.preventDefault();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const newDate = `${year}-${month}-${day}`;
    const formdata = new FormData();
    formdata.append('file', file);
    formdata.append('date', newDate);
    formdata.append('region', region);
    formdata.append('zone_Subcity', zone_Subcity);
    formdata.append('woreda', woreda);
    formdata.append('facilityName', facilityName);
    formdata.append('dnNo', dnNo);
    formdata.append('podNo', podNo);
    formdata.append('orderNo', orderNo);
    formdata.append('manualDeliveryNo', manualDeliveryNo);
    formdata.append('registeredBy', localStorage.getItem('FullName'));
    formdata.append('receivedBy', receivedBy);
    try {
      const res = await axios.post(`${api_url}/api/addPod`, formdata);
      alert(res.data.message);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchOptions = async (endpoint, setter) => {
    try {
      const response = await fetch(`${api_url}/api/${endpoint}`);
      const data = await response.json();
      setter(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOptions('regions', setData);
    fetchOptions('zones', setZone);
    fetchOptions('woredas', setInfoWoreda);
    fetchOptions('facilities', setInfoFacility);
    fetchOptions('receivedBy', setInfoPodReceiver);
  }, []);

  return (
    <Container maxWidth="md">
      <StyledForm onSubmit={submitUploaded}>
        <Typography variant="h4" gutterBottom>
          Add Pod
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Date</InputLabel>
              <DatePicker selected={date} onChange={(date) => setDate(date)} className="form-input" />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select value={region} onChange={(e) => setRegion(e.target.value)} className='form-input'>
                <MenuItem value="">Select Region</MenuItem>
                {infoRegion.map((data) => (
                  <MenuItem key={data.region_name} value={data.region_name}>
                    {data.region_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Zone/Subcity</InputLabel>
              <Select value={zone_Subcity} onChange={(e) => setZone_Subcity(e.target.value)} className='form-input'>
                <MenuItem value="">Select Zone/Subcity</MenuItem>
                {infoZone.map((data) => (
                  data.region_name === region && (
                    <MenuItem key={data.zone_name} value={data.zone_name}>
                      {data.zone_name}
                    </MenuItem>
                  )
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Woreda</InputLabel>
              <Select value={woreda} onChange={(e) => setWoreda(e.target.value)} className='form-input'>
                <MenuItem value="">Select Woreda</MenuItem>
                {infoWoreda.map((data) => (
                  data.zone_name === zone_Subcity && (
                    <MenuItem key={data.woreda_name} value={data.woreda_name}>
                      {data.woreda_name}
                    </MenuItem>
                  )
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Facility Name</InputLabel>
              <Select value={facilityName} onChange={(e) => setFacilityName(e.target.value)} className='form-input'>
                <MenuItem value="">Select Facility</MenuItem>
                {infoFacility.map((data) => (
                  data.woreda_name === woreda && (
                    <MenuItem key={data.facility_name} value={data.facility_name}>
                      {data.facility_name}
                    </MenuItem>
                  )
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DN Number"
              variant="outlined"
              value={dnNo}
              onChange={(e) => setDnNo(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Order Number"
              variant="outlined"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Manual Delivery No"
              variant="outlined"
              value={manualDeliveryNo}
              onChange={(e) => setManualDeliveryNo(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pod Number"
              variant="outlined"
              value={podNo}
              onChange={(e) => setPodNo(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Pod Receiver</InputLabel>
              <Select value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} className='form-input'>
                <MenuItem value="">Select Receiver</MenuItem>
                {infoPodReceiver.map((data) => (
                  <MenuItem key={data.receiver} value={data.receiver}>
                    {data.receiver}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" component="label" fullWidth>
              Attach Model
              <input type="file" onChange={handleFile} hidden required />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Grid>
        </Grid>
      </StyledForm>
    </Container>
  );
};

export default AddPod;

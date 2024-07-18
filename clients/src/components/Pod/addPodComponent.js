import { useEffect, useState } from 'react';
import './AddPodComponent.css';
import axios from 'axios'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddPod = () => {
  
  const api_url = process.env.REACT_APP_API_URL;
  const [file, setFile] = useState()
  const [date, setDate] = useState(new Date());
  const [region, setRegion]= useState('')
  const [zone_Subcity, setZone_Subcity]= useState('')
  const [woreda, setWoreda]= useState('')
  const [facilityName, setFacilityName]= useState('')
  const [dnNo, setdnNo]= useState('')
  const [orderNo, setorderNo]= useState('')
  const [podNo, setpodNo]= useState('')
  const [manualDeliveryNo, setmanualDeliveryNo]= useState('')
  const [registeredBy, setregisteredBy]= useState('')
  const [receivedBy, setreceivedBy]= useState('')
  const [infoRegion , setData] = useState([])
  const [infoZone , setZone] = useState([])
  const [infoWoreda , setInfoWoreda] = useState([])
  const [infoFacility , setInfoFacility] = useState([])
  const [infoPodReceiver , setInfoPodReceiver] = useState([])


  const submitUploaded = async(e) =>{     
    e.preventDefault();   
    const day = date.getDate();
    const month = date.getMonth()+1;
    const year = date.getFullYear();
    const newDate = `${year}-${month}-${day}`
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
    await axios.post(`${api_url}/api/addPod`, formdata)
      .then((res)=> {
        alert(res.data.message);
        window.location.reload();
      })
      .catch(err=> console.log(err));
    }

    const handleFile = (e)=>{
      setFile(e.target.files[0])
     }

    const getRegion =  ()=>{
      fetch(`${api_url}/api/regions`)
      .then((e)=>{
          return e.json()
      })
        .then((infoRegion)=>{
        setData(infoRegion)
      })       
      }
      useEffect(()=>
        { 
            getRegion()
        } ,[]) 

      const getZone =  ()=>
      {
            fetch(`${api_url}/api/zones`)
            .then((e)=>{
                return e.json()
            })
            .then((infoZone)=>{
            setZone(infoZone)
            })       
      }
      useEffect(()=>
      { 
              getZone()
      } ,[]) 

      const getWoreda =  ()=>
      {
            fetch(`${api_url}/api/woredas`)
            .then((e)=>{
                return e.json()
            })
            .then((infoWoreda)=>{
            setInfoWoreda(infoWoreda)
            })       
      }
      useEffect(()=>
      { 
              getWoreda()
      } ,[]) 

      const getFacility =  ()=>
      {
            fetch(`${api_url}/api/facilities`)
            .then((e)=>{
                return e.json()
            })
            .then((infoFacility)=>{
            setInfoFacility(infoFacility)
            })       
      }
      useEffect(()=>
      { 
              getFacility()
      } ,[]) 

      const getPodReceiver =  ()=>
      {
            fetch(`${api_url}/api/receivedBy`)
            .then((e)=>{
                return e.json()
            })
            .then((infoPodReceiver)=>{
            setInfoPodReceiver(infoPodReceiver)
            })       
      }
      useEffect(()=>
      { 
              getPodReceiver()
      } ,[]) 


  return (
    <div className="form-container">
      <form className="form" onSubmit={submitUploaded}>

         <h2 className="form-title">Add Pod</h2>

         <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Date
            <br/><br/>
           <DatePicker selected={date} onChange={(date) => setDate(date)} className='form-input'/>
           </label>
         </div>
      
        <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Region
            <br/><br/>
            <select value={region} placeholder='select' onChange={(e)=> setRegion(e.target.value)} className='form-input'>
              
            <option>Select Region</option>
            {
              infoRegion.map((data)=>{
                return(
                <option value={data.region_name}>{data.region_name}</option>
                    )})
            }
            </select>

          </label>
        </div>

        <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Zone/Subcity       
            <br/><br/>

            <select value={zone_Subcity} onChange={(e)=> setZone_Subcity(e.target.value)} className='form-input'>
              <option>select Zone/Subcity</option>
              {
              infoZone.map((data)=>{
              if(data.region_name === region){
                return(
                <option value={data.zone_name}> {data.zone_name} </option>
                    )
                }
              })
              }

          </select>
          </label>

        </div>

        <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Woreda   
            <br/><br/>

            <select value={woreda} onChange={(e)=> setWoreda(e.target.value)} className='form-input'>
              <option>Select Woreda</option>
              {
              infoWoreda.map((data)=>{
              if(data.zone_name === zone_Subcity){
                return(
                <option value={data.woreda_name}> {data.woreda_name} </option>
                    )
                }
              })
              }
            </select>

          </label>
        </div>

        <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Facility Name   
            <br/><br/>
            <select value={facilityName} onChange={(e)=> setFacilityName(e.target.value)} className='form-input'>
              <option>select Facility</option>
              {
              infoFacility.map((data)=>{
              if(data.woreda_name === woreda){
                return(
                <option value={data.facility_name}> {data.facility_name} </option>
                    )
                }
              })
              }
            </select>
          </label>
        </div>

        <div className="form-group">
              <label htmlFor="name" className="form-label">DN Number</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                onChange={(e)=> setdnNo(e.target.value)}
                required  />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Order Number</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            onChange={(e)=> setorderNo(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
              <label htmlFor="name" className="form-label">Manual Delivery No</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                onChange={(e)=> setmanualDeliveryNo(e.target.value)}
                required  />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Pod Number</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            onChange={(e)=> setpodNo(e.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor="name" className="form-label">
            Pod Receiver
            <br/><br/>
            <select value={receivedBy} placeholder='select' onChange={(e)=> setreceivedBy(e.target.value)} className='form-input'>
              
            <option>Select Receiver</option>
            {
              infoPodReceiver.map((data)=>{
                return(
                <option value={data.receiver}>{data.receiver}</option>
                    )})
            }
            </select>

          </label>
        </div>

        <label>
          Attach Model :
        <input type = 'file' onChange={handleFile} required/>
        </label>                               

        <br/> <br/>
        <button type="submit" className="form-button">Submit</button>
      </form>

    </div>
  );
};

export default AddPod;

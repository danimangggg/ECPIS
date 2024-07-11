import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddCreaditComponent.css'
import { useLocation, useNavigate } from "react-router-dom";

const UpdateComponent = () => {
   const navigate = useNavigate();
    const api_url = process.env.REACT_APP_API_URL;
    const fileName = useLocation();
    const id = (fileName.state.idNo);
    const [message, setMessage] = useState('');
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
    const [pod , setpod] = useState([])

 const submitUploaded = async (e) =>{      
    e.preventDefault();    
    const formdata = new FormData();
    
    if(region != ""){
    formdata.append('region', region);
    }
    if(zone_Subcity != ""){
    formdata.append('zone_Subcity', zone_Subcity);
    }
    if(woreda != ""){
    formdata.append('woreda', woreda);
    }
    if(facilityName != ""){
    formdata.append('facilityName', facilityName);
    }
    formdata.append('dnNo', dnNo);
    formdata.append('podNo', podNo);
    formdata.append('orderNo', orderNo);
    formdata.append('manualDeliveryNo', manualDeliveryNo);
    formdata.append('registeredBy', registeredBy);
    formdata.append('receivedBy', receivedBy);
   
     await axios.put(`${api_url}/api/updatePod/${id}`, formdata) 
      .then(
        //navigate('/viewPod'),
        //window.location.reload()
        )
      .catch(err=> console.log(err));
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

    const GetPod = () =>{
      fetch(`${api_url}/api/findPod/${id}`)
      .then((e)=>{
        return e.json()
      })
      .then((pod)=>{
        setpod(pod)
      })
    }
      useEffect(()=>{
        GetPod()
      },[])
    

  return (
    <div className="form-container">
      <form className="form" onSubmit={submitUploaded}>
        
      
    <div className='form-group'>
     <label>
       Region
       <br/><br/>
       <select value={region} placeholder='select' onChange={(e)=> setRegion(e.target.value)} className='form-input'>
       
          <option value={pod.region}>{pod.region}</option>
            {
          infoRegion.map((data)=> {
            if(data.region_name != pod.region){
          return(
          <option value={data.region_name}>{data.region_name}</option>
            
          )}
        }
               )
       }
       </select>

     </label>
   </div>

   <div className='form-group'>
     <label>
       Zone/Subcity       
       <br/><br/>

       <select value={zone_Subcity} onChange={(e)=> setZone_Subcity(e.target.value)} className='form-input'>
      
       <option value={pod.zone_Subcity}>{pod.zone_Subcity}</option>
        {
        infoZone.map((data)=>{
        if(data.region_name === region && data.zone_name != pod.zone_Subcity){
          return(
          <option value={data.zone_name}> {data.zone_name} </option>
               )}
         })
         }
     </select>
     </label>

   </div>
   <div className='form-group'>
     <label>
       Woreda   
       <br/><br/>

       <select value={woreda} onChange={(e)=> setWoreda(e.target.value)} className='form-input'>
      
       <option value={pod.woreda}>{pod.woreda}</option>
         {
        infoWoreda.map((data)=>{
        if(data.zone_name === zone_Subcity && data.woreda_name != pod.woreda){
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
     <label>
       Facility Name   
       <br/><br/>
       <select value={facilityName} onChange={(e)=> setFacilityName(e.target.value)} className='form-input'>
       
       <option value={pod.facilityName}> {pod.facilityName} </option>
         {
        infoFacility.map((data)=>{
        if(data.woreda_name === woreda && data.facilityName != pod.facilityName){
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
                placeholder={pod.dn_no}
                className="form-input"
                onChange={(e)=> setdnNo(e.target.value)}
                required
                 />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Order Number</label>
          <input
            type="text"
            id="name"
            placeholder={pod.order_no}
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
                placeholder={pod.manual_dno}
                className="form-input"
                onChange={(e)=> setmanualDeliveryNo(e.target.value)}
                required
                 />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Pod Number</label>
          <input
            type="text"
            id="name"
            placeholder={pod.pod_no}
            name="name"
            className="form-input"
            onChange={(e)=> setpodNo(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
              <label htmlFor="name" className="form-label">Registered By</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={pod.registered_by}
                className="form-input"
                onChange={(e)=> setregisteredBy(e.target.value)}
                required
                 />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Received By</label>
          <input
            type="text"
            id="name"
            placeholder={pod.received_by}
            name="name"
            className="form-input"
            onChange={(e)=> setreceivedBy(e.target.value)}
            required
          />
        </div>
        
        <br/> <br/>
        <button type="submit" className="form-button">Submit</button>
      
      </form>
      <p>{message}</p>
    </div>
  );
        }

export default UpdateComponent;

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
    const [fiscalYear, setfiscalYear]= useState('')
    const [region, setRegion]= useState('')
    const [zone_Subcity, setZone_Subcity]= useState('')
    const [woreda, setWoreda]= useState('')
    const [facilityName, setFacilityName]= useState('')
    const [facilityDeligate, setFacilityDeligate]= useState('')
    const [creaditAmount, setCreaditAmount]= useState('')
    const [infoRegion , setData] = useState([])
    const [infoZone , setZone] = useState([])
    const [infoWoreda , setInfoWoreda] = useState([])
    const [infoFacility , setInfoFacility] = useState([])
    const [credit , setCredit] = useState([])

 const submitUploaded = async () =>{      
    const formdata = new FormData();
    
    if(fiscalYear != ""){
    formdata.append('fiscalYear', fiscalYear);
    }
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
    formdata.append('facilityDeligate', facilityDeligate);
    
    formdata.append('creaditAmount', creaditAmount);
   
     await axios.put(`${api_url}/api/updateContract/${id}`, formdata) 
      .then(
        navigate('/viewContract'),
        navigate(0)
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

    const GetCredit = () =>{
      fetch(`${api_url}/api/find/${id}`)
      .then((e)=>{
        return e.json()
      })
      .then((credit)=>{
        setCredit(credit)
      })
    }
      useEffect(()=>{
        GetCredit()
      },[])
    

  return (
    <div className="form-container">
      <form className="form" onSubmit={submitUploaded}>
        
      <div className='form-group' >
     <label>
       Fiscal Year
       <br/><br/>
       <select value={fiscalYear} placeholder='select' onChange={(e)=> setfiscalYear(e.target.value)} className='form-input'>
       
       <option value={credit.fiscalYear}>{credit.fiscalYear}</option>
         <option value="2015">2015</option>
         <option value="2016">2016</option>
         <option value="2017">2017</option>
       </select>
     </label>
   </div>
      
    <div className='form-group'>
     <label>
       Region
       <br/><br/>
       <select value={region} placeholder='select' onChange={(e)=> setRegion(e.target.value)} className='form-input'>
       
          <option value={credit.region}>{credit.region}</option>
            {
          infoRegion.map((data)=> {
            if(data.region_name != credit.region){
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
      
       <option value={credit.zone_Subcity}>{credit.zone_Subcity}</option>
        {
        infoZone.map((data)=>{
        if(data.region_name === region && data.zone_name != credit.zone_Subcity){
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
      
       <option value={credit.woreda}>{credit.woreda}</option>
         {
        infoWoreda.map((data)=>{
        if(data.zone_name === zone_Subcity && data.woreda_name != credit.woreda){
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
       
       <option value={credit.facilityName}> {credit.facilityName} </option>
         {
        infoFacility.map((data)=>{
        if(data.woreda_name === woreda && data.facilityName != credit.facilityName){
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
              <label htmlFor="name" className="form-label">Credit Amount</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={credit.creaditAmount}
                className="form-input"
                onChange={(e)=> setCreaditAmount(e.target.value)}
                required
                 />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Facility Deligate</label>
          <input
            type="text"
            id="name"
            placeholder={credit.facilityDeligate}
            name="name"
            className="form-input"
            onChange={(e)=> setFacilityDeligate(e.target.value)}
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

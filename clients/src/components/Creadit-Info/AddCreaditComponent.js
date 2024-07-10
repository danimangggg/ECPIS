import { useEffect, useState } from 'react';
import './AddCreaditComponent.css';
import axios from 'axios'

const AddCreadit = () => {
  const api_url = process.env.REACT_APP_API_URL;
  const [file, setFile] = useState()
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


  const submitUploaded = async(e) =>{       
    e.preventDefault();
    const formdata = new FormData();
    formdata.append('file', file);
    formdata.append('fiscalYear', fiscalYear);
    formdata.append('region', region);
    formdata.append('zone_Subcity', zone_Subcity);
    formdata.append('woreda', woreda);
    formdata.append('facilityName', facilityName);
    formdata.append('facilityDeligate', facilityDeligate);
    formdata.append('creaditAmount', creaditAmount);
    await axios.post(`${api_url}/api/upload`, formdata)
      .then(
        (res)=> {
          alert(res.data.message);
          setRegion("");
        }

      )
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

  return (
    <div className="form-container">
      <form className="form" onSubmit={submitUploaded}>
         <h2 className="form-title">Add Facility</h2>

     <div className='form-group'>
     <label>
       Fiscal Year
       <br/><br/>
       <select value={fiscalYear} placeholder='select' onChange={(e)=> setfiscalYear(e.target.value)} className='form-input'>
       <option className='select'>Select Fiscal Year</option>
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
     <label>
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
     <label>
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
     <label>
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
              <label htmlFor="name" className="form-label">Creadit Amount</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                onChange={(e)=> setCreaditAmount(e.target.value)}
                required  />
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Facility Deligate</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            onChange={(e)=> setFacilityDeligate(e.target.value)}
            required
          />
        </div>
        <label>
          Attach Document :
        <input type = 'file' onChange={handleFile} required/>
        </label>                               

        <br/> <br/>
        <button type="submit" className="form-button">Submit</button>
      </form>

    </div>
  );
};

export default AddCreadit;

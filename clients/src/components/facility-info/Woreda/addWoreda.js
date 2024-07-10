import { useEffect, useState } from 'react';
import './AttractiveForm.css';
import axios from 'axios'

const AddWoreda = () => {

  const api_url = process.env.REACT_APP_API_URL; 
  const [region2, setRegion]= useState('')
  const [zone_Subcity2, setZone_Subcity]= useState('')
  const [woreda2, setWoreda]= useState('')
  const [infoRegion2 , setData] = useState([])
  const [infoZone2 , setZone] = useState([])

  const submitFacility= (e) =>{
   // e.preventDefault();
    const fdata = new FormData();
    fdata.append('region', region2);
    fdata.append('zone', zone_Subcity2);
    fdata.append('woreda', woreda2);
    axios.post(`${api_url}/api/addworeda`, fdata)
      .then((res)=> {
        alert(res.data.message)
        setRegion("");
      }
        )
      .catch(err=> console.log(err));
    }

    const getRegion =  ()=>{
    fetch(`${api_url}/api/regions`)
    .then((e)=>{
        return e.json()
    })
    .then((infoRegion2)=>{
    setData(infoRegion2)
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
          .then((infoZone2)=>{
          setZone(infoZone2)
          })       
    }
    useEffect(()=>
    { 
            getZone()
    } ,[]) 


  return (
    <div className='form-container'>
      <form className="form" onSubmit={submitFacility}>
         <h2 className="form-title">Add Woreda</h2>
      
         <div className='form-group'>
     <label>
       Region
       <br/><br/>
       <select value={region2} placeholder='select' onChange={(e)=> setRegion(e.target.value)} className='form-input'>
        
       <option>Select Region</option>
       {
        infoRegion2.map((data)=>{
          return(
          <option key={data.region_name} value={data.region_name}>{data.region_name}</option>
               )
         })
       }
       </select>

     </label>
   </div>

   <div className='form-group'>
     <label>
       Zone/Subcity       
       <br/><br/>

       <select value={zone_Subcity2} onChange={(e)=> setZone_Subcity(e.target.value)} className='form-input'>
         <option>select Zone/Subcity</option>
        {
        infoZone2.map((data)=>{
        if(data.region_name === region2){
          return(
          <option key={data.zone_name} value={data.zone_name}> {data.zone_name} </option>
               )
          }
         })
         }

     </select>
     </label>
   </div>

   <div className="form-group">
          <label htmlFor="name" className="form-label">Woreda name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={woreda2}
            onChange= {(e)=> setWoreda(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button">Submit</button>
      </form>
    </div>
  );
};

export default AddWoreda;

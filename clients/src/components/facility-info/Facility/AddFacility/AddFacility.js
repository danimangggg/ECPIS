import { useEffect, useState } from 'react';
import './AttractiveForm.css';
import axios from 'axios'

const AddFacility = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const api_url = process.env.REACT_APP_API_URL
    const handleOptionChange = (event) => {
      setSelectedOption(event.target.value);
    }

  const [region2, setRegion]= useState('')
  const [zone_Subcity2, setZone_Subcity]= useState('')
  const [woreda2, setWoreda]= useState('')
  const [facilityName2, setFacilityName]= useState('')
  const [infoRegion2 , setData] = useState([])
  const [infoZone2 , setZone] = useState([])
  const [infoWoreda2 , setInfoWoreda] = useState([])

  const submitFacility= async(e) =>{
    const fdata = new FormData();
    fdata.append('region_name', region2);
    fdata.append('zone_name', zone_Subcity2);
    fdata.append('woreda_name', woreda2);
    fdata.append('facility_name', facilityName2);
    fdata.append('facility_type', selectedOption);
    await axios.post(`${api_url}/api/addfacility`, fdata)
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

    const getWoreda =  ()=>
    {
          fetch(`${api_url}/api/woredas`)
          .then((e)=>{
              return e.json()
          })
          .then((infoWoreda2)=>{
          setInfoWoreda(infoWoreda2)
          })       
    }
    useEffect(()=>
    { 
            getWoreda()
    } ,[]) 


  return (
    <div className="form-container">
      <form className="form" onSubmit={submitFacility}>
         <h2 className="form-title">Add Facility</h2>
      
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

        <div className='form-group'>
          <label>
            Woreda   
            <br/><br/>
            <select value={woreda2} onChange={(e)=> setWoreda(e.target.value)} className='form-input'>
              <option>Select Woreda</option>
              {
            infoWoreda2.map((data)=>{
            if(data.zone_name === zone_Subcity2){
              return(
              <option key={data.woreda_name} value={data.woreda_name}> {data.woreda_name} </option>
                    )
              }
              })
              }
            </select>

          </label>
        </div>

        <div className="form-group">
              <label htmlFor="name" className="form-label">Facility Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={facilityName2}
                onChange= {(e)=> setFacilityName(e.target.value)}
                required
              />
            </div>

        <div className="radio">
        <label>
        <input
          type="radio"
          value="Health Center"
          checked={selectedOption === 'Health Center'}
          onChange={handleOptionChange}
        />
        Health Center
      </label>
      
      <label>
        <input
          type="radio"
          value="Hospital"
          checked={selectedOption === 'Hospital'}
          onChange={handleOptionChange}
        />
        Hospital
        
      </label>

      <label>
        <input
          type="radio"
          value="Others"
          checked={selectedOption === 'Others'}
          onChange={handleOptionChange}
        />
        Others
        
      </label>
        </div>
              <br/>
        <button type="submit" className="form-button">Submit</button>
      </form>
    </div>
  );
};

export default AddFacility;

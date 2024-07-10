import MUIDataTable from "mui-datatables";
import { useEffect, useState } from 'react';

const WoredaComponent = () => {
  const api_url = process.env.REACT_APP_API_URL;
    const [info , setData] = useState([])
    const columns = [
        {
         name: "region_name",
         label: "Region",
         options: {
          filter: true,
          sort: false,
         }
        },
        {
         name: "zone_name",
         label: "Zone/subcity",
         options: {
          filter: true,
          sort: false,
         }
        },
        {
         name: "woreda_name",
         label: "Woreda",
         options: {
          filter: true,
          sort: false,
         }
        },
        
       ];

    const getUser =  ()=>{
        fetch(`${api_url}/api/woredas`)
        .then((e)=>{
            return e.json()
        })
        .then((info)=>{
        setData(info)
        })       
     }
    useEffect(()=>
        { 
            getUser()
        } ,[])
       
       const options = {
         filterType: 'checkbox',
         responsive: 'standard'
       };
       
  return (
    <div style={{display: 'table', tableLayout:'fixed'}}>
        <MUIDataTable
        title={"Woreda list"}
        data={info}
        columns={columns}
        options={options}
            />
    </div>
  )
}

export default WoredaComponent




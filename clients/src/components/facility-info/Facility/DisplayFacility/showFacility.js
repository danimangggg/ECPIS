import MUIDataTable from "mui-datatables";
import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const ShowFacilityComponent = () => {
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
        {
         name: "facility_name",
         label: "Facility",
         options: {
          filter: true,
          sort: false,
         }
        },
        {
            name: "facility_type",
            label: "Facility Type",
            options: {
             filter: true,
             sort: false,
            }
           },
       ];

    const getUser =  ()=>{
        fetch(`${api_url}/api/facilities`)
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

    const getMuiTheme = () => createTheme({
            components: {
              MUIDataTableBodyCell: {
                styleOverrides:{
                  root: {
                      backgroundColor: "white"
                  }
                }
              }
            }
          })
        
    const options = {
         filterType: 'checkbox',
         responsive: 'standard',
         onRowClick: (rowData, rowMeta) => {
            console.log('Row data:', rowData);
            console.log('Row index:', rowMeta.dataIndex);   
          },
       };
       
    return (
        <div style={{display: 'table', tableLayout:'fixed'}}>     
            <ThemeProvider theme={getMuiTheme}>
            <MUIDataTable
            title={"Facility list"}
            data={info}
            columns={columns}
            options={options}
            loading={true}
                />
               </ThemeProvider>
        </div>
    )
    }

    export default ShowFacilityComponent




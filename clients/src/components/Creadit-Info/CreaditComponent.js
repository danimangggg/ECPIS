import MUIDataTable from "mui-datatables";
import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


const CreaditComponent = () => {
const [info , setData] = useState([])
const navigate = useNavigate();
const api_url = process.env.REACT_APP_API_URL;

    const columns = [
      {
        name: "id",
        label: "Serial NO",
        options: {
         filter: false,
         sort: false,
         display:false
        }
       },
        {
            name: "fiscalYear",
            label: "Fiscal Year",
            options: {
             filter: true,
             sort: false,
            }
           },

           {
            name: "facilityName",
            label: "Facility",
            options: {
             filter: false,
             sort: false,
            }
           },

           {
            name: "woreda",
            label: "Woreda",
            options: {
             filter: true,
             sort: false,
            }
           },

           {
            name: "zone_Subcity",
            label: "Zone/Subcity",
            options: {
             filter: true,
             sort: false,
            }
           },

        {
         name: "region",
         label: "Region",
         options: {
          filter: true,
          sort: false,
         }
        },

        {
         name: "facilityDeligate",
         label: "Deligate",
         options: {
          filter: false,
          sort: false,
         }
        }, 

        {
            name: "creaditAmount",
            label: "Credit amount",
            options: {
             filter: false,
             sort: false,
             customBodyRender: (value) => {
              // Format number with commas
              const formattedValue = Number(value).toLocaleString();
              return <span>{formattedValue}</span>;
              }
            }
           },

           {
            name: "image",
            label: "Contract PDF",
            options: {
             filter: false,
             sort: false,
             display: false
            }
           },
       ];

    const getUser = async ()=>{
        await fetch(`${api_url}/api/all`)
        .then((e)=>{
            return e.json()
          })
        .then((info)=>{
        setData(info)
        })       
         }
        useEffect( ()=>
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
         onRowClick: (rowData, rowMeta) => {
            const fname = JSON.stringify(rowData[8], null, 2);
            const id = JSON.stringify(rowData[0], null, 2);
            navigate({pathname: '/detailPage'}, {state:{ docname: fname, identity: id }});     
          },
          selectableRows: false,
          responsive: 'standard'
          }
       
    return (
        <div style={{display: 'table', tableLayout:'fixed', width:'90%'}}>     
            <ThemeProvider theme={getMuiTheme}>
            <MUIDataTable
            title={"Contract list"}
            data={info}
            columns={columns}
            options={options}
                />
               </ThemeProvider>
        </div>
    )
    }

    export default CreaditComponent




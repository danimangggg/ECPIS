import MUIDataTable from "mui-datatables";
import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


const PodComponent = () => {
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
         name: "region",
         label: "Region",
         options: {
          filter: true,
          sort: false,
         }
        },
        {
         name: "zone_Subcity",
         label: "Zone/subcity",
         options: {
          filter: true,
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
         name: "facilityName",
         label: "Facility",
         options: {
          filter: false,
          sort: false,
         }
        },
        {
         name: "dn_no",
         label: "DN No",
         options: {
          filter: false,
          sort: false,
         }
        },  
        {
            name: "pod_no",
            label: "Pod No",
            options: {
             filter: false,
             sort: false,
            }
           },

           {
            name: "order_no",
            label: "Order No",
            options: {
             filter: true,
             sort: false,
            }
           },
           {
            name: "manual_dno",
            label: "Manual Delivery No",
            options: {
             filter: false,
             sort: false,
            }
           },
           {
            name: "registered_by",
            label: "Registered By",
            options: {
             filter: false,
             sort: false,
            }
           },  
           {
               name: "received_by",
               label: "Received By",
               options: {
                filter: false,
                sort: false,
               }
              },
              {
                name: "image",
                label: "Model 19",
                options: {
                 filter: false,
                 sort: false,
                }
               },
       ];

    const getUser = async ()=>{
        await fetch(`${api_url}/api/viewPod`)
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
            const fname = JSON.stringify(rowData[11], null, 2);
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
            title={"Pod list"}
            data={info}
            columns={columns}
            options={options}
                />
               </ThemeProvider>
        </div>
    )}

    export default PodComponent




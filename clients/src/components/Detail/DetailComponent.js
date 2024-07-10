
import { useState } from 'react';
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from 'axios'
import { FaEdit,  FaTrash, FaBackward } from 'react-icons/fa'

const PdfViewer = ({ pdf }) => {
    const navigate = useNavigate();
    const [response, setResponse] = useState(null);
    const api_url = process.env.REACT_APP_API_URL;
    const fileName = useLocation();
    const nameStri = (fileName.state.docname);
    const id = (fileName.state.identity);
    const docName = (nameStri.replace(/['"]+/g, ''));

    const deleteContractFunction = ()=>{
      try{
      const res = axios.delete(`${api_url}/api/deleteContract/${id}`);
      setResponse(res.data);
      navigate({pathname: '/viewContract'});
      navigate(0);
      }catch (error){
        console.log(error)
      }
    }

    const editContract = () =>{
      navigate({pathname: '/updateCreadit'}, {state:{idNo : id}});
           
    }

  return (
    <div style={{ width: '100%', height: '800px', backgroundColor: '#333' }}>
      <Link to="/viewContract"  >
      <span >
        <FaBackward className='icon' size="30" style={{ marginTop: '20px', marginRight:'80px', color: 'white'}}/>
        </span>
      </Link>
      <span >
        <FaTrash onClick={deleteContractFunction} className='icon' size="30" style={{ marginTop: '20px', color: 'white'}}/>
        </span>
      <span >
        <FaEdit onClick={editContract} className='icon' size="30" style={{ marginTop: '20px', color: 'white'}}/>
        </span>

      <iframe
        title="Contract document"
        src={`${api_url}/${docName}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};

export default PdfViewer;

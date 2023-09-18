import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TopNav from '../components/topNav'; 


function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    axios.get(`/datasets/${id}`)
      .then(response => setDataset(response.data))
      .catch(error => console.log(error));
  }, [id]);


  return (
    <div className='page-container'>
      
      
      
      
      <div className='content-container'>
      {
        dataset ?(
          <h1>{dataset.name}</h1>
        ) : (
          <p>Loading dataset details...</p>
        )
      }
      </div>

    </div>
  );
}

export default DatasetsDetails;














import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TopNav from '../components/topNav';
import './datasetsDetails.css';

function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    axios.get(`/datasets/${id}`)
      .then(response => {
        setDataset(response.data);
        setIsLoading(false); // Set loading state to false when data is received
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false); // Set loading state to false on error as well
      });
  }, [id]);


  return (
    <div className='page-container'>
      <div className='content-container'>
        {isLoading ? (
          <p>Loading dataset details...</p>
        ) : (
          <div>
            <h1>{dataset.name}</h1>
            <p>Description: {dataset.description}</p>

            <div className='image-gallery'>
              {dataset.images.map(imageUrl => (
                <img
                  key={imageUrl} // Use the URL as the key
                  src={imageUrl} // Set the URL as the src attribute
                  alt="Image"
                  className='image-item'
                />
              ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatasetsDetails;





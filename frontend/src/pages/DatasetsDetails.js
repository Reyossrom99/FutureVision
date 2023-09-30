import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';



function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);

  const [isLoading, setIsLoading] = useState(true); // Loading state

  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 100; 

  const [showLabels, setShowLabels] = useState(false); 

  // useEffect(() => {
  //   axios.get(`/datasets/${id}`)
  //     .then(response => {
  //       setDataset(response.data);
  //       setIsLoading(false); // Set loading state to false when data is received
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       setIsLoading(false); // Set loading state to false on error as well
  //     });
  // }, [id]);

  // const fechData = async () => {
  //   try{
  //       const response = await axios.get('/datasets/${id}/?show_labels=${showLabels}')
  //       .then(response => {
  //         setDataset(response.data);
  //         setIsLoading(false);
  //       })
  //   }catch(error){
  //     console.log("Error fetching the images", error); 
  //   }
  // }; 

  const fetchData = (datasetId, shouldShowLabels) => {
    setIsLoading(true); // Set loading state to true when starting a new request
    axios.get(`/datasets/${datasetId}?showLabels=${shouldShowLabels}`)
        .then(response => {
            setDataset(response.data);
            setIsLoading(false); // Set loading state to false when data is received
        })
        .catch(error => {
            console.log(error);
            setIsLoading(false); // Set loading state to false on error as well
        });
  };

  useEffect(() => {
      fetchData(id, showLabels);
  }, [id, showLabels]);

  const totalImages = dataset ? dataset.images.length :0; 
  const totalPages = Math.ceil(totalImages /itemsPerPage); 

  const startIndex = (currentPage -1) * itemsPerPage; 
  const endIndex = startIndex + itemsPerPage; 

  const displayedImages = dataset ? dataset.images.slice(startIndex, endIndex) : []; 

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); 
  }

  const handleCheckboxChange = () => {
    setShowLabels(!showLabels); // Toggle checkbox state
    fetchData(id, !showLabels); // Fetch data with updated showLabels status
  };

  return (
    <div className='page-container'>
      <div className='content-container'>


        {isLoading ? (
          <p>Loading dataset details...</p>
        ) : (
          <div>
            <h1>{dataset.name}</h1>
            <p>Description: {dataset.description}</p>
            <label>
            <input type='checkbox' checked={showLabels} onChange={() => setShowLabels(!showLabels)} />
            Show Labels
          </label>
            <div className='image-gallery'>
              {displayedImages.map(imageUrl => (
                <img
                  key={imageUrl}
                  src={imageUrl} // Set the URL as the src attribute
                  alt={imageUrl}
                  className='image-item'
                />
              ))}
            </div>
          </div>
        )}

        <div className='pagination-controls'>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span> 
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};



export default DatasetsDetails;





import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext  } from '../context/selectSplitViewContext';
import { useCreateSplitContext} from '../context/createSplitsContext'; 
import styles from './datasets.module.css'



function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);

  const [isLoading, setIsLoading] = useState(true); // Loading state

  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 100; 

  const { showLabels } = useCheckbox(); 

  const {selectedSplit} = useSplitContext ();
  
  const {buttonClicked} = useCreateSplitContext(); 

  useEffect(() => {
    fetchData(id, showLabels, selectedSplit, buttonClicked);
  }, []); 

  const fetchData = (datasetId, shouldShowLabels, requestSplitView, buttonClicked) => {
    setIsLoading(true); // Set loading state to true when starting a new request
    axios.get(`/datasets/${datasetId}?showLabels=${shouldShowLabels}&request-split=${requestSplitView}`)
        .then(response => {
            setDataset(response.data);
            setIsLoading(false); // Set loading state to false when data is received
        })
        .catch(error => {
            console.log(error);
            setIsLoading(false); // Set loading state to false on error as well
        });
  };



  const totalImages = dataset ? dataset.images.length :0; 
  const totalPages = Math.ceil(totalImages /itemsPerPage); 

  const startIndex = (currentPage -1) * itemsPerPage; 
  const endIndex = startIndex + itemsPerPage; 

  const displayedImages = dataset ? dataset.images.slice(startIndex, endIndex) : []; 

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); 
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>


        {isLoading ? (
          <p >Loading dataset details...</p>
        ) : (
          <div className={styles.datasetDetailsContainer}>
            <h1 className={styles.pageName}>{dataset.name}</h1>
            <p>{dataset.description}</p>
            <div className={styles.imageGalery}>
              {displayedImages.map(imageUrl => (
                <img
                  key={imageUrl}
                  src={imageUrl} // Set the URL as the src attribute
                  alt={imageUrl}
                  className={styles.imageItem}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.paginationControls}>
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





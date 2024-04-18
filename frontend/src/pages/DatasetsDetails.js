import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext  } from '../context/selectSplitViewContext';
import { useCreateSplitContext} from '../context/createSplitsContext'; 
import styles from './datasets.module.css'
import AuthContext from '../context/AuthContext';

function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  
  const { showLabels } = useCheckbox(); 
  const {selectedSplit} = useSplitContext();
  const {buttonClicked} = useCreateSplitContext(); 
  const { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    getDataset(id, showLabels, selectedSplit, currentPage);
  }, [id, showLabels, selectedSplit, currentPage]);

  const getDataset = async (datasetId, shouldShowLabels, requestSplitView, page) => {
    try {
      const response = await fetch(`/datasets/${datasetId}?showLabels=${shouldShowLabels}&request-split=${requestSplitView}&page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDataset(data);
        setIsLoading(false); 
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching dataset:', error);
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        {isLoading ? (
          <p>Loading dataset details...</p>
        ) : dataset && (
          <div className={styles.datasetDetailsContainer}>
            <h1 className={styles.pageName}>{dataset.name}</h1>
            <p>{dataset.description}</p>
            <div className={styles.imageGalery}>
              {dataset.images.map(imageUrl => (
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
            Page {currentPage} of {dataset ? dataset.total_pages : 0}
          </span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (dataset ? dataset.total_pages : 0)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatasetsDetails;





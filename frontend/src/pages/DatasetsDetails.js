import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext  } from '../context/selectSplitViewContext';
import forgetForm from '../components/forgetDatasetForm';
import ForgetForm from '../components/forgetDatasetForm';


function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);

  const [isLoading, setIsLoading] = useState(true); // Loading state

  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 100; 

  const { showLabels } = useCheckbox(); 

  const {selectedSplit} = useSplitContext (); 

  const [isFormOpen, setIsFormOpen] = useState(false); 


  const fetchData = (datasetId, shouldShowLabels, requestSplitView) => {
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

  useEffect(() => {
    fetchData(id, showLabels, selectedSplit);

    // Event listener for beforeunload event
    const handleBeforeUnload = (event) => {
      // Show the modal form when the user tries to close the tab
      setIsFormOpen(true);
      event.preventDefault();
      // Standard for most browsers
      event.returnValue = '';
    };

    // Event listener for click event on menu items
    const handleMenuItemClick = (event) => {
      // Check if the clicked element is a menu item or a link
      const isMenuItem = event.target.classList.contains('sidenav'); // Add a specific class to your menu items
      if (isMenuItem) {
        // Show the modal form when the user clicks on a menu item
        setIsFormOpen(true);
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleMenuItemClick);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleMenuItemClick);
    };
  }, [id, showLabels, selectedSplit]);


  const totalImages = dataset ? dataset.images.length :0; 
  const totalPages = Math.ceil(totalImages /itemsPerPage); 

  const startIndex = (currentPage -1) * itemsPerPage; 
  const endIndex = startIndex + itemsPerPage; 

  const displayedImages = dataset ? dataset.images.slice(startIndex, endIndex) : []; 

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); 
  }

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
      {isFormOpen && <ForgetForm isOpen={isFormOpen} onRequestClose={() => setIsFormOpen(false)} />}
    </div>
  );
};



export default DatasetsDetails;





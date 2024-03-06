import React, { useEffect, useState, useContext} from 'react';
import axios from 'axios';
import FormDialog from '../components/newDatasetForm';
import styles from './datasets.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewButtonContext } from '../context/createNewContext';

import AuthContext from '../context/AuthContext';

//make http request to /datasets when enter the page 
function Datasets() {
  const [datasets, setDatasets] = useState([]); //get the data from the backend
  const [postResponse, setPostRequest] = useState(null); //send and recive post from the backend
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isDialogOpen, handleCloseDialog } = useCreateNewButtonContext();
  const { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    getDatasets();
  }, []);
  const getDatasets = async () => {
    try {
      const response = await fetch('/datasets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  return (
    <div className={styles.pageContainer}>

      <div className={styles.contentContainer}>
        <h1 className={styles.pageName}>DATASETS</h1>

        <div className={styles.datasetContainer}>
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <Link to={`/datasets/${dataset.id}`} key={dataset.id} className={styles.datasetCardLink}>
                <div key={dataset.id} className={styles.datasetCard}>
                  <img
                    src={dataset.cover_url} //dataset url
                    alt={dataset.name}
                    className={styles.datasetImage}
                  />

                  <div className={styles.datasetInfo}>
                    <h2 className={styles.datasetName}>{dataset.name}</h2>
                    <p className={styles.datasetDescription}>{dataset.description}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No datasets available</p>
          )}


        </div>


        <FormDialog isOpen={isDialogOpen} onRequestClose={handleCloseDialog} />
      </div>
    </div>
  );
}
export default Datasets; 
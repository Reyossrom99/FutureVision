import React, { useEffect, useState, useContext } from 'react';
import axios, { HttpStatusCode } from 'axios';
import { useParams } from 'react-router-dom';
import styles from './datasets.module.css'
import NewTrainForm from '../components/newTrainForm';
import AuthContext from '../context/AuthContext';
import {useCreateNewTrainContext } from '../context/createNewContext';


function ProyectDetails() {
  const { id } = useParams();
  const [proyect, setProyect] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { isDialogOpen, handleCloseDialog } = useCreateNewTrainContext();
  const { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    getProject(id); 
  }, [id]); 
  const getProject = async (projectId) => {
    try{
        const response = await fetch ( `http://localhost:8000/proyects/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(authTokens.access)
          }
        }); 
        if (response.ok){
          const data = await response.json()
          setProyect(data); 
          setIsLoading(false); 
        } else if (response.status === 401){
          logoutUser(); 
        }
    }catch (error) {
      console.error('Error fetching dataset:', error);
      
    }
  }; 



  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className={styles.datasetDetailsContainer}>
            <NewTrainForm isOpen={isDialogOpen} onRequestClose={handleCloseDialog} proyectId={proyect.proyect_id} />
          </div>
        )}
      </div>
    </div>
  );
}
export default ProyectDetails;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './datasets.module.css'



function ProyectDetails() {
  const { id } = useParams();
  const [proyect, setProyect] = useState(null);




  const fetchData = (proyectId) => {
   
    axios.get(`/proyects/${proyectId}`)
        .then(response => {
            setProyect(response.data);
            
        })
        .catch(error => {
            console.log(error);
           
        });
  };




  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
          <div className={styles.datasetDetailsContainer}>
            <h1 className={styles.pageName}>{proyect.name}</h1>
          </div>
      </div>
    </div>
  );
};
export default ProyectDetails;

import React, { useEffect, useState, useContext } from 'react';
import axios, { HttpStatusCode } from 'axios';
import { useParams } from 'react-router-dom';
import styles from './datasets.module.css'
import NewTrainForm from '../components/newTrainForm';
import AuthContext from '../context/AuthContext';
import {useCreateNewTrainContext } from '../context/createNewContext';
import { PaginatorButton, CardButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainerTraining, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';
import Paginator from '../elements/paginator';

function ProjectDetails() {
  const { id } = useParams();
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { isDialogOpen, handleCloseDialog } = useCreateNewTrainContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1); 
  const [total_pages, setTotalPages] = useState(1); 

  useEffect(() => {
    getProject(id, currentPage); 
  }, [id, currentPage]); 
  const getProject = async (projectId, page) => {
	  console.log(projectId)
    try{
        const response = await fetch ( `http://localhost:8000/projects/${projectId}?page=${page}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(authTokens.access)
          }
        }); 
        if (response.ok){
          const data = await response.json()
          setTrainings(data.trainings); 
          setIsLoading(false); 
	  setTotalPages(data.total_pages); 
        } else if (response.status === 401){
          logoutUser(); 
        }
    }catch (error) {
      console.error('Error fetching dataset:', error);
      
    }
  }; 

  
    const handleClick = () => {
      window.open('http://localhost:6006', '_blank'); // Abre TensorBoard en una nueva pestaña
    };
  
  const viewLog = async (trainingId) => { 
    try {
        const response = await fetch(`http://localhost:8000/projects/log/${trainingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access) 
            }
        });

        if (response.ok) {
            const logText = await response.text();

            // Crear una nueva ventana y mostrar el log
            const logWindow = window.open('', '_blank');
            if (logWindow) {
                logWindow.document.write(`<pre>${logText}</pre>`);
            } else {
                alert('No se pudo abrir la ventana emergente. Asegúrate de permitir ventanas emergentes en tu navegador.');
            }
        } else if (response.status === 401) {
            // Manejar caso de Unauthorized
            logoutUser(); // Define tu función de logout
        } else {
            // Manejar otros casos de error
            console.error('Error al descargar el archivo de log:', response.statusText);
            alert('Error al descargar el archivo de log. Por favor, intenta de nuevo más tarde.');
        }
    } catch (error) {
        console.error('Error al descargar el archivo de log:', error);
        alert('Error al descargar el archivo de log. Por favor, intenta de nuevo más tarde.');
    }
};
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

  }
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }
  return (
    <PageContainer>
    <PageTitle>projects</PageTitle>
    <ContentContainer>
      <CardGroup>
        {trainings.length > 0 ? (
          trainings.map((training) => (
            <CardContainerTraining key={training.training_id}>
              <CardTitle>{formatDate(training.created_at)}</CardTitle>
              {training.current_status === 'completed' ? (
                <>
                  <CardButton type="button" onClick={() => viewLog(training.training_id)}>Log view</CardButton>
                </>
              ) : (
                <>
                  <CardButton type="button" onClick={handleClick}>Tensorboard</CardButton>
                </>
              )}
              <CardLabels>
                <CardLabel style={{ backgroundColor: palette.secondary }}>{training.current_status}</CardLabel>
              </CardLabels>
            </CardContainerTraining>
          ))
        ) : (
          <p>This project has not been trained</p>
        )}
      </CardGroup>
    </ContentContainer>
    <Paginator>
      <PaginatorButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        previous
      </PaginatorButton>
      <span>
        page {currentPage} of {trainings ? total_pages : 0}
      </span>
      <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (trainings ? total_pages : 0)}>
        next
      </PaginatorButton>
    </Paginator>
    <NewTrainForm isOpen={isDialogOpen} onRequestClose={handleCloseDialog} projectId={id} />
  </PageContainer>
  ); 
}
export default ProjectDetails;

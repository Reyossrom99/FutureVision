import React, { useEffect, useState, useContext } from 'react';
import axios, { HttpStatusCode } from 'axios';
import { useParams , useNavigate} from 'react-router-dom';
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
import { useDeleteProjectContext } from '../context/deleteContext';

function ProjectDetails() {
  const { id } = useParams();
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { isDialogOpen, handleCloseDialog, setOnCloseCallback } = useCreateNewTrainContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1); 
  const [total_pages, setTotalPages] = useState(1); 
  const { askForConfirmationProject , deleteConfirmationProject} = useDeleteProjectContext();
  const { confirmDeleteProject } = useDeleteProjectContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmDeleteProject) {
      if (window.confirm(`Do you want to delete this project?: ${id}`)) {
        deleteProject(id);
      }else{
          deleteConfirmationProject(); 
      }
    }
  },[confirmDeleteProject]); 

  useEffect(() => {
    getProject(id, currentPage); 
  }, [id, currentPage]); 

 useEffect(() => {
    setOnCloseCallback(() => () => {
      getProject(id, currentPage); 
    });
  }, [currentPage, setOnCloseCallback, id]);
 
  const getProject = async (projectId, page) => {
	  console.log(projectId)
    try{
        const response = await fetch ( `http://localhost:4004/projects/${projectId}?page=${page}`, {
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
        const response = await fetch(`http://localhost:4004/projects/log/${trainingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access) 
            }
        });

        if (response.ok) {
            // Crear un enlace de descarga
            const logUrl = URL.createObjectURL(await response.blob());

            // Crear un enlace y hacer clic en él para iniciar la descarga
            const a = document.createElement('a');
            a.href = logUrl;
            a.download = 'data_train.log'; // Nombre del archivo a descargar
            document.body.appendChild(a);
            a.click();

            // Limpiar recursos
            URL.revokeObjectURL(logUrl);
            document.body.removeChild(a);
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

const weights = async (trainingId) => {
    try {
        const response = await fetch(`http://localhost:4004/projects/weights/${trainingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
            }
        });

        if (response.ok) {
            // Crear un enlace de descarga
            const zipUrl = URL.createObjectURL(await response.blob());

            // Crear un enlace y hacer clic en él para iniciar la descarga
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = 'weights.zip'; // Nombre del archivo a descargar
            document.body.appendChild(a);
            a.click();

            // Limpiar recursos
            URL.revokeObjectURL(zipUrl);
            document.body.removeChild(a);
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
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
}
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
  };


  const deleteProject = async (projectId) => {
    let url = `http://localhost:4004/projects/project/${projectId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + String(authTokens.access),
      },
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/projects');
      deleteConfirmationProject(); 
    }
    else {
      if (data && data.error) {
        console.error('Error deleting dataset:', data.error);
        deleteConfirmationProject(); 
      }
    }
  };

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
  		  <CardButton type="button" onClick={() => weights(training.training_id)}>Weights</CardButton>

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

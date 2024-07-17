import React, { useEffect, useState, useContext } from 'react';
import axios, { HttpStatusCode } from 'axios';
import { useParams } from 'react-router-dom';
import styles from './datasets.module.css'
import NewTrainForm from '../components/newTrainForm';
import AuthContext from '../context/AuthContext';
import {useCreateNewTrainContext } from '../context/createNewContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainer, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';
import Paginator from '../elements/paginator';

function ProyectDetails() {
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
        const response = await fetch ( `http://localhost:8000/proyects/${projectId}?page=${page}`, {
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

  }

  return (
   <PageContainer>
    <PageTitle> PROYECTS </PageTitle>
    <ContentContainer>
        <CardGroup>
	  {trainings.length > 0 ? (
            trainings.map((training) => (
              <CardContainer key={training.training_id}>
                <CardTitle>{training.created_at}</CardTitle>
                <CardLabels>
                  <CardLabel style={{ backgroundColor: palette.secondary }}>{training.current_status}</CardLabel>
                </CardLabels>
              </CardContainer>
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
            page {currentPage} of {trainings? total_pages : 0}
        </span>
        <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (trainings ? total_pages : 0)}>
            next
        </PaginatorButton>
    </Paginator>
     <NewTrainForm isOpen={isDialogOpen} onRequestClose={handleCloseDialog} proyectId={id} />
</PageContainer>
  ); 
}
export default ProyectDetails;

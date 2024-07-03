import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import FormDialog from '../components/newDatasetForm';
import styles from './datasets.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewButtonContext } from '../context/createNewContext';
import Paginator from '../elements/paginator';
import AuthContext from '../context/AuthContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainer, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';

function Datasets() {
  const [datasets, setDatasets] = useState([]); //get the data from the backend
  const [postResponse, setPostRequest] = useState(null); //send and recive post from the backend
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isDialogOpen, handleCloseDialog } = useCreateNewButtonContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [total_pages, setTotalPages] = useState(1);

  useEffect(() => {
    getDatasets(currentPage);
  }, [currentPage]);


  const getDatasets = async (page) => {
    try {
      const response = await fetch(`/datasets?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets);
        setTotalPages(data.total_pages);
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

  }
  return (
      <PageContainer>
        <PageTitle>DATASETS</PageTitle>
        <ContentContainer>
				<CardGroup>
	{datasets.length > 0 ? 
	( datasets.map(dataset => 
	( <Link to={`/dataset/${dataset.dataset_id}`} key={dataset.id} > <CardContainer key={dataset.id} > <CardImage
                    src={dataset.cover_url} //dataset url
                    alt={dataset.name}
                    className={styles.datasetImage}
                  />
                  <div >
                    <CardTitle>{dataset.name}</CardTitle>
                    <CardLabels>
                    <CardLabel style={{backgroundColor: palette.secondary }}>{dataset.format}</CardLabel>
                    {dataset.is_public ? <CardLabel style={{backgroundColor: palette.accent }} >Public</CardLabel> : <CardLabel style={{backgroundColor: palette.accent }}>Private</CardLabel>}
                    <CardLabel style={{backgroundColor: palette.primary }}>{dataset.type}</CardLabel>
                    </CardLabels>
                  </div>
                </CardContainer>
              </Link>
            ))
            
          ) : (
            <p>No datasets available</p>
          )}
	</CardGroup>
          </ContentContainer>
          <Paginator>
            <PaginatorButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              previous
            </PaginatorButton>
            <span>
              page {currentPage} of {datasets ? total_pages : 0}
            </span>
            <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (datasets ? total_pages : 0)}>
              next
            </PaginatorButton>
          </Paginator>
        <FormDialog isOpen={isDialogOpen} onRequestClose={handleCloseDialog} />
    
    </PageContainer>
  );
}
export default Datasets; 

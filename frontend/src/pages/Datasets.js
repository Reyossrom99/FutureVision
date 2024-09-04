import React, { useEffect, useState, useContext } from 'react';
import FormDialog from '../components/newDatasetForm';
import { Link, Route, BrowserRouter as Router, Switch, useNavigate } from 'react-router-dom';
import { useCreateNewButtonContext } from '../context/createNewContext';
import Paginator from '../elements/paginator';
import AuthContext from '../context/AuthContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle} from '../elements/title';
import { Message, Error } from '../elements/p';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainer, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';
import {useTypeContext} from '../context/typeContext';

function Datasets() {
  const [datasets, setDatasets] = useState([]); //get the data from the backend
  const [postResponse, setPostRequest] = useState(null); //send and recive post from the backend
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isDialogOpen, handleCloseDialog, setOnCloseCallback} = useCreateNewButtonContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [total_pages, setTotalPages] = useState(1);
  const {setType} = useTypeContext();
  const [error, setError] = useState(null);  
  const navigate = useNavigate();

  useEffect(() => {
    getDatasets(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setOnCloseCallback(() => () => {
      getDatasets(currentPage); // Recargar los datasets cuando se cierre el modal
    });
  }, [currentPage, setOnCloseCallback]);

  const getDatasets = async (page) => {
    setError(null); 
    try {
      const response = await fetch(`http://localhost:4004/datasets?page=${page}`, {
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
        window.scrollTo(0, 0);
        setType(data.type); 
      } else if (response.status === 401) {
        logoutUser();
        navigate("/login"); 
      }else {
        const data = await response.json();
        setError(data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setError(null); 
    setCurrentPage(newPage);

  }
 
    return (
      <PageContainer>
        <PageTitle>DATASETS</PageTitle>
        {error ? (
          <Error style={{ color: 'red' }}>{error}</Error>  // Mostrar mensaje de error si existe
        ) : (
          <>
            <ContentContainer>
              <CardGroup>
                {datasets.length > 0 ? (
                  datasets.map(dataset => (
                    <Link 
                      to={{ 
                        pathname: `/dataset/${dataset.dataset_id}`
                      }} 
                      key={dataset.dataset_id} 
                      style={{textDecoration: 'none'}} // Cambiado de dataset.id a dataset.dataset_id
                    >
                      <CardContainer key={dataset.dataset_id}>  {/* Cambiado de dataset.id a dataset.dataset_id */}
                        <CardImage
                          src={dataset.cover_url}
                          alt={dataset.name}
                        />
                        <div>
                          <CardTitle>{dataset.name}</CardTitle>
                          <CardLabels>
                            <CardLabel style={{ backgroundColor: palette.secondary }}>{dataset.format}</CardLabel>
                            {dataset.is_public ? (
                              <CardLabel style={{ backgroundColor: palette.accent }}>Public</CardLabel>
                            ) : (
                              <CardLabel style={{ backgroundColor: palette.accent }}>Private</CardLabel>
                            )}
                            <CardLabel style={{ backgroundColor: palette.primary }}>{dataset.type}</CardLabel>
                          </CardLabels>
                        </div>
                      </CardContainer>
                    </Link>
                  ))
                ) : (
                  <Message>No datasets available</Message>
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
          </>
        )}
      </PageContainer>
    );
  }

export default Datasets; 

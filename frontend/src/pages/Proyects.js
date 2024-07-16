import React, {useEffect, useState, useContext} from 'react'; 
import axios from 'axios'; 
import styles from './proyects.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewProjectContext } from '../context/createNewContext';
import FormDialog from '../components/newProyectForm';
import AuthContext from '../context/AuthContext';
import Paginator from '../elements/paginator';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainer, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';

function Proyects(){
    const [proyects, setProyects] = useState([]); 
    const {isDialogOpen, handleCloseDialog} = useCreateNewProjectContext(); 
    const { authTokens, logoutUser} = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1); 
    const [total_pages, setTotalPages] = useState(1); 

    useEffect(() => {
               getProyects(currentPage); 
    }, [currentPage]); 
    const getProyects = async (page) => {
        try {
            const response = await fetch(`http://localhost:8000/proyects?page=${page}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
              }
            });
            if (response.ok) {
              const data = await response.json();
              setProyects(data.proyects);
	      console.log(data.poyects); 
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
	    <PageTitle> PROYECTS </PageTitle>
	    <ContentContainer>
	    <CardGroup>
	    {proyects.lenght > 0 ? 
		    ( proyects.map(proyect => 
				    ( <Link to={`/project/${proyect.proyect_id}`} key={proyect.id}>
					    <CardContainer key={proyect.id}>
						<CardTitle>{proyect.id} </CardTitle>
					    	<CardLabels>
						{proyect.is_public ? (
                    					<CardLabel style={{backgroundColor: palette.accent }}>Public</CardLabel>
                  				) : (
                   					 <CardLabel style={{backgroundColor: palette.accent }}>Private</CardLabel>
                  				)}
					    	<CardLabel style={{backgroundColor: palette.secondary }}> {proyect.created_at} </CardLabel>
						</CardLabels>
					    </CardContainer>
					</Link> ))
		    ): (
			    <p> No proyects available </p>
			)}
		</CardGroup>
	    </ContentContainer>
	   <Paginator>
            <PaginatorButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              previous
            </PaginatorButton>
            <span>
              page {currentPage} of {proyects ? total_pages : 0}
            </span>
            <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (proyects ? total_pages : 0)}>
              next
            </PaginatorButton>
          </Paginator>
 	<FormDialog isOpen={isDialogOpen} onRequestClose={handleCloseDialog}/>
  </PageContainer>
    );
}
export default Proyects; 

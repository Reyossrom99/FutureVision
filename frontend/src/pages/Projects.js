import React, {useEffect, useState, useContext} from 'react'; 
import axios from 'axios'; 
import { Link, Route, BrowserRouter as Router, Switch, useNavigate } from 'react-router-dom';
import { useCreateNewProjectContext } from '../context/createNewContext';
import FormDialog from '../components/newProjectForm';
import AuthContext from '../context/AuthContext';
import Paginator from '../elements/paginator';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import {CardContainerprojects, CardImage, CardTitle, CardLabel, CardDescription, CardLabels, CardGroup}from '../elements/card';
import palette from '../palette';
import { Message, Error } from '../elements/p'; 

function Projects(){
    const [projects, setprojects] = useState([]); 
    const {isDialogOpen, handleCloseDialog, setOnCloseCallback} = useCreateNewProjectContext(); 
    const { authTokens, logoutUser} = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1); 
    const [total_pages, setTotalPages] = useState(1); 
    const [error, setError] = useState(null);  
    const navigate = useNavigate();


    useEffect(() => {
               getprojects(currentPage); 
    }, [currentPage]); 
    useEffect(() => {
    	setOnCloseCallback(() => () => {
      	getprojects(currentPage); // Recargar los datasets cuando se cierre el modal
    	});
     }, [currentPage, setOnCloseCallback]);

    const getprojects = async (page) => {
        setError(null); 
        try {
            const response = await fetch(`http://localhost:4004/projects?page=${page}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
              }
            });
            if (response.ok) {
                const data = await response.json(); 
                setprojects(data.projects);
                console.log(data.projects); 
                setTotalPages(data.total_pages); 
            } else if (response.status === 401) {
              logoutUser();
              navigate("/login"); 
            }else {
                const data = await response.json(); 
                setError(data.error); 
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

      {error && (
        <Error style={{ color: 'red' }}>{error}</Error>
      )}
  
     
      {!error && (
        <>
          <PageTitle>PROJECTS</PageTitle>
          <ContentContainer>
            <CardGroup>
              {projects.length > 0 ? (
                projects.map(project => (
                  <Link to={`/project/${project.project_id}`} key={project.project_id} style={{textDecoration: 'none'}}>  {/* Cambiado de project.id a project.project_id */}
                    <CardContainerprojects key={project.project_id} style={{textDecoration: 'none'}}> {/* Cambiado de project.id a project.project_id */}
                      <CardTitle>{project.name}</CardTitle>
                      <CardLabels>
                        {project.is_public ? (
                          <CardLabel style={{ backgroundColor: palette.accent }}>Public</CardLabel>
                        ) : (
                          <CardLabel style={{ backgroundColor: palette.accent }}>Private</CardLabel>
                        )}
                        <CardLabel style={{ backgroundColor: palette.secondary }}>{project.start_date}</CardLabel>
                      </CardLabels>
                    </CardContainerprojects>
                  </Link>
                ))
              ) : (
                <Message>No projects available</Message>
              )}
            </CardGroup>
          </ContentContainer>
          <Paginator>
            <PaginatorButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              previous
            </PaginatorButton>
            <span>
              page {currentPage} of {projects ? total_pages : 0}
            </span>
            <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (projects ? total_pages : 0)}>
              next
            </PaginatorButton>
          </Paginator>
          <FormDialog isOpen={isDialogOpen} onRequestClose={handleCloseDialog} />
        </>
      )}
    </PageContainer>
  );
  
}
export default Projects; 

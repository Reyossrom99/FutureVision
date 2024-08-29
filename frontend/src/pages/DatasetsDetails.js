import React, { useEffect, useState, useContext } from 'react';
import { Navigate, useParams, useNavigate} from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateSplitContext } from '../context/createSplitsContext';
import { useDeleteDatasetContext } from '../context/deleteContext';
import styles from './datasets.module.css';
import AuthContext from '../context/AuthContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer , SpinnerContainer} from '../elements/containers';
import Paginator from '../elements/paginator';
import { css } from '@emotion/react';
import { ClipLoader } from 'react-spinners';
import { useModifyContext } from '../context/modifyContext';
import ModifyDatasetDialog from '../components/modifyDatasetDialogForm';
import CreateSplitsDialog from '../components/createSplitsDialog';
import { useSaveDatasetContext } from '../context/saveContext';
import { ImageContainer, StyledImage, ImageGallery} from '../elements/image';
import { useLocation } from 'react-router-dom';
import { useTypeContext } from '../context/typeContext';
import {  Error } from '../elements/p';

function DatasetsDetails() {

  const { id} = useParams();
  const location = useLocation();

  // Extraer el parámetro 'type' de la consulta
  const queryParams = new URLSearchParams(location.search);

  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedImage, setExpandedImage] = useState(null);
  const [total_pages, setTotalPages] = useState(1);
  const { showLabels } = useCheckbox();
  const { selectedSplit } = useSplitContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const { buttonClicked, setReloadDataset, reloadDataset} = useCreateSplitContext();
  const { askForConfirmation , deleteConfirmation} = useDeleteDatasetContext();
  const { confirmDeleteDataset } = useDeleteDatasetContext();
  const {isModifyDialogOpen, handleCloseModifyDialog} = useModifyContext();
  const {modify, setModify} = useModifyContext();
  const {privacy, setPrivacy} = useModifyContext();
  const {description, setDescription} = useModifyContext();
  const {isCreateSplitDialogOpen, handleCloseCreateSplitDialog, handleCreateSplitDialog} = useCreateSplitContext();
  const {confirmSaveDataset, saveConfirmationSaveDataset} = useSaveDatasetContext();

  const  {datasetName, setDatasetName} = useState("");
  const {setType} = useTypeContext();
  const [error, setError] = useState(null);  

   
  //dataset obtained from the last request 
  const fields = []; 
  const values = [];

  const navigate = useNavigate();

  let last_request_split = "";
  const deleteTempFolder = async (datasetId) => {
    setError(null); 
    let url = `http://localhost:4004/datasets/${datasetId}/tmp`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + String(authTokens.access),
      },
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/datasets');
     
    }
    else {
      if (data && data.error) {
        setError(data.error)
      }
    }
  };

  const deleteDataset = async (datasetId) => {
    setError(null); 
    let url = `http://localhost:4004/datasets/${datasetId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + String(authTokens.access),
      },
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/datasets');
      deleteConfirmation(); 
    }
    else {
      if (data && data.error) {
        setError(data.error)
        deleteConfirmation(); 
      }
    }
  };

  const saveDatasetChanges = async(datasetId, fields, values) => {
    setError(null); 
    fields.length = 0
    values.length = 0
    fields.push('splits')
    values.push(true)

    try{
      const response = await fetch(`http://localhost:4004/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + String(authTokens.access),
        },
        body: JSON.stringify({
          fields: fields,
          values: values,
        }),
      });
	setIsLoading(true);
      if (response.ok) {
        fields.length = 0
        values.length = 0
        saveConfirmationSaveDataset(); 
        navigate(`/datasets`);
      } else {
        const data = await response.json();
        setError(data.error)
        saveConfirmationSaveDataset();
      }
    }catch (error) {
            console.log('Error creating dataset:', error);
        }
  }; 

  const getDataset = async (datasetId, shouldShowLabels, requestSplitView, page, last_request_split, setPrivacy, setDescription, setType) => {
      let currentPage = page;
      setError(null); 
        //TODO CUANDO CAMBIE DE SPLIT VOLVER A LA PAGINA 1 -> TENER EN CUENTA EL CAMNIO DE SPLIT//TODO CUANDO CAMBIE DE SPLIT VOLVER A LA PAGINA 1 -> TENER EN CUENTA EL CAMNIO DE SPLIT
      window.scrollTo(0, 0);
      setIsLoading(true);
          
          try {
            let url = `http://localhost:4004/datasets/${datasetId}?showLabels=${shouldShowLabels}&page=${currentPage}`;

      if (requestSplitView !== "" ){

              url += `&request-split=${requestSplitView}`;
      }
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + String(authTokens.access),
              },
            });
            if (response.ok) {
              const data = await response.json();
              setDataset(data);
              setIsLoading(false);
              setTotalPages(data.total_pages);
              //for modify context dialog
              setDescription(data.description);
              setPrivacy(data.privacy);
      //set type in case of change	
        setType(data.type); 
        console.log('Dataset Type:', data.type);
            } else if (response.status === 401) {
              logoutUser();
            }
          } catch (error) {
            console.error('Error fetching dataset:', error);
            setIsLoading(false);
      
          }

    };

  useEffect(() => {
    if (confirmDeleteDataset) {
      if (window.confirm(`Do you want to delete this dataset?: ${id}`)) {
        deleteDataset(id);
      }else{
          deleteConfirmation(); 
      }
    }

    if (confirmSaveDataset) {
      if (window.confirm(`Do you want to save the changes made to this dataset?: ${id}`)) {
        saveDatasetChanges(id, fields, values);
      }else{
          saveConfirmationSaveDataset();
      }
    }
    if (reloadDataset) {
      setCurrentPage(1);
      getDataset(id, showLabels, selectedSplit, currentPage, last_request_split, setPrivacy, setDescription, setType);
      setReloadDataset	 (false);  
    }

  }, [ confirmDeleteDataset, confirmSaveDataset, fields, values, reloadDataset, id, showLabels, selectedSplit, currentPage, last_request_split, setPrivacy, setDescription, setType]);

  useEffect(() => {
	  console.log("Loading dataset"); 
	getDataset(id, showLabels, selectedSplit, currentPage, last_request_split, setPrivacy, setDescription, setType);
  }, [currentPage, showLabels, selectedSplit, last_request_split, id, setPrivacy, setDescription, setType]);

  useEffect(() => {
    // Cuando el componente se desmonta (usuario navega fuera de la ruta)
    return () => {
        deleteTempFolder(id);
    };
  }, [location.pathname]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(expandedImage === imageUrl ? null : imageUrl);
  };

  return (
    <PageContainer>
      {/* Mostrar el mensaje de error si existe */}
      {error && (
        <Error style={{ color: 'red' }}>{error}</Error>
      )}
  
      {/* Mostrar el spinner si se está cargando */}
      {isLoading ? (
        <ContentContainer>
          <PageTitle className={styles.pageName}></PageTitle>
          <SpinnerContainer>
            <ClipLoader color="#7F5A83" loading={isLoading} size={35} />
          </SpinnerContainer>
        </ContentContainer>
      ) : dataset && (
        <>			
          <PageTitle className={styles.pageName}>{dataset.name}</PageTitle>
  
          <ContentContainer>
            <ImageGallery>
              {dataset.images.map((imageUrl) => (
                <ImageContainer key={imageUrl}>						
                  <StyledImage
                    src={imageUrl}
                    alt={imageUrl}
                    className={`${styles.imageItem} ${expandedImage === imageUrl ? styles.expanded : ''}`}
                    onClick={() => handleImageClick(imageUrl)}
                  />
                </ImageContainer>
              ))}
            </ImageGallery>
  
            {expandedImage && (
              <div className={styles.overlay} onClick={() => setExpandedImage(null)}>
                <img src={expandedImage} alt={expandedImage} className={styles.expandedImage} />
              </div>
            )}
  
          </ContentContainer>
  
          <Paginator>
            <PaginatorButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              previous
            </PaginatorButton>
            <span>
              page {currentPage} of {dataset ? total_pages : 0}
            </span>
            <PaginatorButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (dataset ? total_pages : 0)}>
              next
            </PaginatorButton>
          </Paginator>
  
          <ModifyDatasetDialog isOpen={isModifyDialogOpen} onRequestClose={handleCloseModifyDialog} privacy={privacy} description={description} datasetId={id} />
          <CreateSplitsDialog isOpen={isCreateSplitDialogOpen} onRequestClose={handleCloseCreateSplitDialog} datasetId={id} />
        </>	
      )}
    </PageContainer>
  );
  
}

export default DatasetsDetails;
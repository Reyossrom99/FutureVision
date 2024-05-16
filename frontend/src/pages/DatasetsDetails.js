import React, { useEffect, useState, useContext } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateSplitContext } from '../context/createSplitsContext';
import { useDeleteDatasetContext } from '../context/deleteContext';
import styles from './datasets.module.css';
import AuthContext from '../context/AuthContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import Paginator from '../elements/paginator';
import { css } from '@emotion/react';
import { BeatLoader } from 'react-spinners';
import { useModifyContext } from '../context/modifyContext';
import ModifyDatasetDialog from '../components/modifyDatasetDialogForm';

function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedImage, setExpandedImage] = useState(null);
  const [total_pages, setTotalPages] = useState(1);
  const { showLabels } = useCheckbox();
  const { selectedSplit } = useSplitContext();
  const { authTokens, logoutUser } = useContext(AuthContext);
  const { buttonClicked } = useCreateSplitContext();
  const { askForConfirmation } = useDeleteDatasetContext();
  const { confirmDeleteDataset } = useDeleteDatasetContext();
  const {isModifyDialogOpen, handleCloseModifyDialog} = useModifyContext();
  const {modify, setModify} = useModifyContext();
  const {privacy, setPrivacy} = useModifyContext();
 const {description, setDescription} = useModifyContext();
  

  const navigate = useNavigate();

  let last_request_split = "";

  const deleteDataset = async (datasetId) => {
    let url = `/datasets/${datasetId}`;
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
      askForConfirmation(false);
    }
    else {
      if (data && data.error) {
        console.error('Error deleting dataset:', data.error);
      }
    }
  };

  useEffect(() => {
    if (confirmDeleteDataset) {
      if (window.confirm(`Do you want to delete this dataset?: ${id}`)) {
        deleteDataset(id);
      }
    }
    const getDataset = async (datasetId, shouldShowLabels, requestSplitView, page, last_request_split) => {
      let currentPage = page;


      if (last_request_split != requestSplitView) {
        currentPage = 1;
        last_request_split = requestSplitView;
      }

      try {
        let url = `/datasets/${datasetId}?showLabels=${shouldShowLabels}&page=${currentPage}`;

        if (requestSplitView !== "") {
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
        } else if (response.status === 401) {
          logoutUser();
        }
      } catch (error) {
        console.error('Error fetching dataset:', error);
        setIsLoading(false);
      }
    };

    getDataset(id, showLabels, selectedSplit, currentPage, last_request_split);
  }, [id, showLabels, selectedSplit, currentPage, last_request_split, confirmDeleteDataset]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(expandedImage === imageUrl ? null : imageUrl);
  };

  return (
    <PageContainer>
      {isLoading ? (
        <ContentContainer>
          <BeatLoader color="#36D7B7" loading={isLoading} size={15} />
        </ContentContainer>
      ) : dataset && (
        <ContentContainer>
          <PageTitle className={styles.pageName}>{dataset.name}</PageTitle>
          <p>{dataset.description}</p>
          <div className={styles.datasetDetailsContainer}>
            <div className={styles.imageGalery}>
              {dataset.images.map((imageUrl) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={imageUrl}
                  className={`${styles.imageItem} ${expandedImage === imageUrl ? styles.expanded : ''}`}
                  onClick={() => handleImageClick(imageUrl)}
                />
              ))}
            </div>
            {expandedImage && (
              <div className={styles.overlay} onClick={() => setExpandedImage(null)}>
                <img src={expandedImage} alt={expandedImage} className={styles.expandedImage} />
              </div>
            )}
          </div>
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
          <ModifyDatasetDialog isOpen={isModifyDialogOpen} onRequestClose={handleCloseModifyDialog} privacy={privacy} description={description} datasetId={id}/>
        </ContentContainer>
      )}
    </PageContainer>
  );
}

export default DatasetsDetails;

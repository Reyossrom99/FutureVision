import {useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateSplitContext } from '../context/createSplitsContext';
import styles from './datasets.module.css';
import AuthContext from '../context/AuthContext';
import { PaginatorButton } from '../elements/button';
import { PageTitle } from '../elements/title';
import { ContentContainer, PageContainer } from '../elements/containers';
import Paginator from '../elements/paginator';

import { css } from '@emotion/react';
import { BeatLoader } from 'react-spinners';


function DatasetsDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedImage, setExpandedImage] = useState(null);
  const [total_pages, setTotalPages] = useState(1);
  const { showLabels } = useCheckbox();
  const { selectedSplit } = useSplitContext();
  const { buttonClicked } = useCreateSplitContext();
  const { authTokens, logoutUser } = useContext(AuthContext);

  useEffect(() => {
    getDataset(id, showLabels, selectedSplit, currentPage);
  }, [id, showLabels, selectedSplit, currentPage]);

  const getDataset = async (datasetId, shouldShowLabels, requestSplitView, page) => {
    try {
      const response = await fetch(`/datasets/${datasetId}?showLabels=${shouldShowLabels}&request-split=${requestSplitView}&page=${page}`, {
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
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching dataset:', error);
      setIsLoading(false);
    }
  };

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
           <BeatLoader color="#36D7B7" loading={isLoading} size={15}  />
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
          </ContentContainer>
        )}
      
    </PageContainer>
  );
}

export default DatasetsDetails;





import styled from 'styled-components';
import palette from '../palette';

export const ImageContainer = styled.div`
  padding: 20px;
  width: 300px; /* Tamaño fijo de la tarjeta */
  height: 300px; 
  margin-bottom: 20px;
  display: flex;
  flex-direction: column; /* Alinear elementos en columna */
  margin: 20px 20px 20px 20px; /* Margen fijo en los cuatro bordes */
`; 
export const StyledImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 100%; /* Asegura que la imagen no exceda la altura del contenedor */
  object-fit: cover; /* Mantiene la proporción de la imagen y la recorta si es necesario */
  border-radius: 10px; /* Bordes redondeados */
  cursor: pointer; /* Cambia el cursor al pasar sobre la imagen */
`;
export const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap; /* Permite que las imágenes se envuelvan en filas */
  gap: 20px; /* Espacio entre las imágenes */
  justify-content: center; /* Centra las imágenes horizontalmente */
`

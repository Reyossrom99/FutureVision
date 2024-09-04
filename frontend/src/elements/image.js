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

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* Fondo oscuro transparente */
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;


export const ExpandedImage = styled.img`
  max-width: calc(100vw - 40px); /* Ancho máximo de la imagen, con margen de 20px en cada lado */
  max-height: calc(100vh - 40px); /* Altura máxima de la imagen, con margen de 20px en la parte superior e inferior */
  margin: 20px; /* Margen para que la imagen no toque los bordes de la pantalla */
  `;
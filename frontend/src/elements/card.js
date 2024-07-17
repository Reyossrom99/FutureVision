import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import palette from '../palette';


export const CardContainer = styled.div`
  background-color: ${palette.neutralWhite};
  border: 1px solid ${palette.neutralBlack};
  border-radius: 8px;
  padding: 20px;
  width: 300px; /* Tamaño fijo de la tarjeta */
  height: 300px; 
  margin-bottom: 20px;
  display: flex;
  flex-direction: column; /* Alinear elementos en columna */
  margin: 20px 20px 20px 20px; /* Margen fijo en los cuatro bordes */
`;
export const CardContainerProyects = styled.div`
  background-color: ${palette.neutralWhite};
  border: 1px solid ${palette.neutralBlack};
  border-radius: 8px;
  padding: 20px;
  width: 200px; /* Tamaño fijo de la tarjeta */
  height: 150px; 
  margin-bottom: 20px;
  display: flex;
  flex-direction: column; /* Alinear elementos en columna */
  margin: 20px 20px 20px 20px; /* Margen fijo en los cuatro bordes */
`;
export const CardImage = styled.img`
width: 100%;
height: auto; /* La altura se ajustará automáticamente según el ancho */
border-radius: 8px;
flex-grow: 1; /* Permite que la imagen ocupe el espacio restante */
margin-bottom: 20px; /* Agrega un margen inferior para separar la imagen de las etiquetas */
`;

export const CardTitle = styled.h2`
  font-size: 18px;
  margin-top: 0; /* Elimina el margen superior predeterminado */
  margin-bottom: 20px;
  color: ${palette.neutralBlack};
  text-align: center;
  text-transform: lowercase;
  text-decoration: none; 
`;

export const CardLabels = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centra las etiquetas horizontalmente */
  margin-top: auto; /* Mueve las etiquetas hacia abajo */
  margin-bottom: 5px; /* Ajusta el margen inferior entre la imagen y las etiquetas */
`;

export const CardLabel = styled.p`
  margin: 5px 5px; /* Ajusta el margen entre las etiquetas */
  font-size: 14px;
  border: 1px solid ${palette.neutralWhite}; /* Borde del botón */
  color: ${palette.neutralWhite}; /* Color del texto */
  border-radius: 10px; /* Bordes redondeados */
  padding: 5px 10px; /* Ajusta el espaciado interno */
  text-transform: lowercase;
  text-align: center;
`;


export const CardDescription = styled.p`
  font-size: 14px;
  margin: 5px 0;
  color: ${palette.neutralBlack};
  text-transform: lowercase;
`;

export const CardGroup = styled.div`
flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`; 

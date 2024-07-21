import styled from 'styled-components';
import palette from '../palette';

export const Button = styled.button`
  background-color: ${palette.primary };
  border: none;
  border-radius: 20px; /* Bordes redondeados */
  padding: 10px 20px; /* Ajusta el espaciado interno */
  margin-right: 30px;
  font-size: 16px;
  cursor: pointer; /* Cambia el cursor al pasar el ratón */
`;

export const PaginatorButton = styled.button`
background-color: ${palette.neutralWhite}; /* Color de fondo */
border: 1px solid ${palette.neutralBlack}; /* Borde del botón */
color: ${palette.neutralBlack}; /* Color del texto */
border-radius: 5px; /* Bordes redondeados */
padding: 5px 10px; /* Ajusta el espaciado interno */
font-size: 14px; /* Tamaño de fuente */
margin-right: 10px; /* Margen derecho */
cursor: pointer; /* Cambia el cursor al pasar el ratón */
`; 
export const CardButton = styled.button`
background-color: ${palette.neutralWhite}; /* Color de fondo */
border: 1px solid ${palette.neutralBlack}; /* Borde del botón */
color: ${palette.neutralBlack}; /* Color del texto */
border-radius: 5px; /* Bordes redondeados */
padding: 5px 10px; /* Ajusta el espaciado interno */
font-size: 14px; /* Tamaño de fuente */
margin-right: 10px; /* Margen derecho */
cursor: pointer; /* Cambia el cursor al pasar el ratón */
`;
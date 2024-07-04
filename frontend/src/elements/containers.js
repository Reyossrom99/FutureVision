import styled from 'styled-components';
import palette from '../palette';

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to bottom, rgb(152,182,134), rgb(255,255, 255), rgb(255, 255, 255));
  height: 100vh; /* Ocupar toda la altura de la ventana */
  width: 100vw; /* Ocupar toda la anchura de la ventana */
  margin: 0; /* Eliminar los márgenes */
  padding: 0; /* Eliminar el relleno */
  overflow: hidden; /* Ocultar cualquier desbordamiento */
  position: fixed; /* Fijar el contenedor para cubrir toda la pantalla */
  top: 0; /* Colocar el contenedor en la parte superior */
  left: 0; /* Colocar el contenedor en la parte izquierda */
  `;



export const SingupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to bottom, rgb(152,182,134), rgb(255,255, 255), rgb(255, 255, 255));
  height: 100vh; /* Ocupar toda la altura de la ventana */
  width: 100vw; /* Ocupar toda la anchura de la ventana */
  margin: 0; /* Eliminar los márgenes */
  padding: 0; /* Eliminar el relleno */
  overflow: hidden; /* Ocultar cualquier desbordamiento */
  position: fixed; /* Fijar el contenedor para cubrir toda la pantalla */
  top: 0; /* Colocar el contenedor en la parte superior */
  left: 0; /* Colocar el contenedor en la parte izquierda */
  `;


export const PageContainer = styled.div`  
padding-top: 60px; /* Altura de la barra superior */
margin: 20px 20px 20px 20px; /* Margen fijo en los cuatro bordes */
flex-grow: 1;
min-height: 100vh;
`; 


export const ContentContainer = styled.div` 
flex-grow: 1;
padding-top: 40px; /* Altura de la barra superior */
display: flex;
flex-direction: column;
min-height: 100vh;
`; 


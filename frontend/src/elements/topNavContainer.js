import styled from 'styled-components';
import palette from '../palette';

export const TopNavContainer = styled.nav`
  background-color: ${palette.neutralWhite};
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  padding: 0 20px;
  border-bottom: 1px solid ${palette.neutralBlack};
`;

export const TopNavItems = styled.div`
  display: flex;
  align-items: center;
  flex:1; 
  justify-content:space-between; 
 `;



export const TopNavItem = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;

  &:first-child{
  	flex:0; 
  }
  `;


export const TopNavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${palette.neutralBlack};
  font-size: 16px;
`;  

export const LastItem = styled.div`
  
  margin-right: 40px;
`;

export const TopNavSelect = styled.select`
  padding: 5px;
  border: 1px solid ${palette.gray};
  border-radius: 20px; /* Ajusta el radio para hacerlo más cuadrado */
  width: 100%;
  box-sizing: border-box;
 
  &:focus {
    outline: none; /* Quita el contorno predeterminado del foco */
    border-color: ${palette.gray}; /* Establece el color del borde al mismo que el borde normal */
    box-shadow: 0 0 0 0px ${palette.gray}; /* Añade una sombra para resaltar el enfoque sin cambiar el tamaño */
  }
`; 

export const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none; /* Oculta el estilo predeterminado del checkbox */
  padding: 10px;
  border: 1px solid ${palette.gray};
  border-radius: 20px; /* Ajusta el radio para hacerlo más cuadrado */
  width: auto; /* Ajusta el ancho según sea necesario */
  height: auto; /* Ajusta la altura según sea necesario */
  box-sizing: border-box;
  
  &:focus {
    outline: none; /* Quita el contorno predeterminado del foco */
    border-color: ${palette.gray}; /* Establece el color del borde al mismo que el borde normal */
    box-shadow: 0 0 0 1px ${palette.gray}; /* Añade una sombra para resaltar el enfoque sin cambiar el tamaño */
  }
  
  &:checked {
    background-color: ${palette.gray}; /* Cambia el color de fondo cuando está marcado */
  }
`;

export const TopNavLabel = styled.label`
color: ${palette.neutralBlack};
font-size: 16px;
margin-left: 10px;
`;

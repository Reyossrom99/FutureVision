import styled from 'styled-components';
import { Link } from 'react-router-dom';
import palette from '../palette';
import Modal from 'react-modal';

export const Form = styled.form`
display: flex;
flex-direction: column;
align-items: center;
padding: 20px;
max-width: 300px; /* Ancho máximo para el formulario */
width: 100%; /* Hace que el formulario sea receptivo */
margin: auto; /* Centra el formulario en la página */
`;

export const Input = styled.input`
  padding: 12px;
  border: 1px solid ${palette.gray};
  border-radius: 20px; /* Ajusta el radio para hacerlo más cuadrado */
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;
  &:focus {
    outline: none; /* Quita el contorno predeterminado del foco */
    border-color: ${palette.gray}; /* Establece el color del borde al mismo que el borde normal */
    box-shadow: 0 0 0 0px ${palette.gray}; /* Añade una sombra para resaltar el enfoque sin cambiar el tamaño */
  }
`;

export const SubmitInput = styled(Input)`
  background-color: ${palette.primary};
  border: none;
  color: ${palette.neutralWhite};
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
`;

export const ErrorMessage = styled.p`
  color: ${palette.error};
  margin-bottom: 20px;
`;

export const LinkForm = styled(Link)`
  color: ${palette.secondary};
  text-decoration: none;
  margin-bottom: 20px;
`;

export const Title = styled.h2`
  color: ${palette.neutralBlack};
  font-size: 24px;
  margin-bottom: 20px;
  margin-top: 0;
`;

export const Label = styled.label`
color: ${palette.neutralBlack};
font-size: 16px;
margin-bottom: 10px;
`;

export const Select = styled.select`
  padding: 12px;
  border: 1px solid ${palette.gray};
  border-radius: 20px; /* Ajusta el radio para hacerlo más cuadrado */
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;

  &:focus {
    outline: none; /* Quita el contorno predeterminado del foco */
    border-color: ${palette.gray}; /* Establece el color del borde al mismo que el borde normal */
    box-shadow: 0 0 0 0px ${palette.gray}; /* Añade una sombra para resaltar el enfoque sin cambiar el tamaño */
  }
  
`;
export const Option = styled.option`
  padding: 12px;
  border: 1px solid ${palette.gray};
  border-radius: 20px;
  background-color: white;
  color: ${palette.neutralBlack};

  &:hover {
    background-color: ${palette.gray};
    color: white;
  }
`;

export const ButtonContainer = 	styled.div`
display: flex;
  justify-content: center;
  margin-top: 20px;
`; 

export const CustomModal = styled(Modal)`
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  outline: none;
  // Ancho y altura personalizados
  width: 600px; /* Ajusta el ancho del modal */
 
`;

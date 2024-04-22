import styled from 'styled-components';
import { Link } from 'react-router-dom';
import palette from '../palette';

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
  color: ${palette.neutralBlack};
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
`;

export const ErrorMessage = styled.p`
  color: ${palette.accent};
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


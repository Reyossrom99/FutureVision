import styled from 'styled-components';
import palette from '../palette';
const Button = styled.button`
  background-color: ${props => palette.primary };
  border: none;
  border-radius: 20px; /* Bordes redondeados */
  padding: 10px 20px; /* Ajusta el espaciado interno */
  margin-right: 30px;
  font-size: 16px;
  cursor: pointer; /* Cambia el cursor al pasar el ratón */
`;

export default Button;

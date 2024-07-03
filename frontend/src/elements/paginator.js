import styled from "styled-components";
import palette from "../palette";

const Paginator = styled.div`
text-align: center;
padding: 10px; /* Opcional: agrega relleno para espaciamiento */
color: ${props => palette.neutralBlack}; /* Color del texto */
/* Espacio entre los elementos */
& > * {
  margin: 0 5px; /* Ajusta el margen horizontal */
}
`; 
export default Paginator;

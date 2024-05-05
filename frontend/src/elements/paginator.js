import styled from "styled-components";
import palette from "../palette";

const Paginator = styled.div`
position: fixed;
bottom: 0;
left: 50%;
transform: translateX(-50%);
text-align: center;
padding: 10px; /* Opcional: agrega relleno para espaciamiento */
color: ${props => palette.neutralBlack}; /* Color del texto */
/* Espacio entre los elementos */
& > * {
  margin: 0 5px; /* Ajusta el margen horizontal */
}
`; 
export default Paginator;

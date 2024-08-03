import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import palette from '../palette';


export const TableContainer = styled.div`
  background-color: ${palette.neutralWhite};
  padding: 20px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  overflow-x: auto; /* Para manejar el desbordamiento horizontal */

  `;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse; /* Eliminar espacios entre celdas */
`;

export const TableHeader = styled.thead`
  background-color: ${palette.neutralWhite}; /* Puedes ajustar el color si lo deseas */
`;

export const TableHeaderCell = styled.th`
  
  
  text-align: left; /* Ajusta la alineación según tus necesidades */
`;

export const TableBody = styled.tbody`
  background-color: ${palette.neutralWhite}; /* Puedes ajustar el color si lo deseas */
`;

export const TableRow = styled.tr`

  &:nth-child(even) {
    background-color: ${palette.neutralLight}; /* Para filas alternas, ajusta el color si es necesario */
  }
`;

export const TableCell = styled.td`
    padding: 20px;
  text-align: left; /* Ajusta la alineación según tus necesidades */
  color: ${palette.neutralBlack};
`;


export const Input = styled.input`
  padding: 5px;
  border: 1px solid ${palette.neutralBlack};
  border-radius: 4px;
 margin-right:10px;
`;


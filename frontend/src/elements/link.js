// Link.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import palette from '../palette'; 

export const StyledLink = styled(Link)`
  background-color: ${palette.neutralWhite};
  color: ${palette.secondary};
  border: none; 
  margin-right: 10px;
`;



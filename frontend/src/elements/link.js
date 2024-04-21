// Link.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  background-color: ${props => props.theme.neutralWhile};
  color: ${props => props.theme.primary};
  border: none; 
  margin-right: 10px;
`;

export default StyledLink;

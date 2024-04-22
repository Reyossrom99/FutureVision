import styled from 'styled-components';
import palette from '../palette';

const TopNavContainer = styled.nav`
  background-color: ${props => palette.neutralWhite};
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

export default TopNavContainer;
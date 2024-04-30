import styled from 'styled-components';
import palette from '../palette';

export const TopNavContainer = styled.nav`
  background-color: ${props => palette.neutralWhite};
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
  margin-left: 10px;
  margin-right: 10px; /* Espacio entre el último elemento y el borde derecho */
`;

export const TopNavItem = styled.div`
  margin-right: 100px; /* Espacio entre elementos */
`;
export const LastItem = styled.div`
  
  margin-right: auto;
`;

export const TopNavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${palette.neutralBlack};
  font-size: 16px;
`;  
import styled from 'styled-components';
import palette from '../palette';

export const TopNavContainer = styled.nav`
  background-color: ${palette.neutralWhite};
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
  flex:1; 
  justify-content:space-between; 
 `;



export const TopNavItem = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;

  &:first-child{
  	flex:0; 
  }
  `;


export const TopNavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${palette.neutralBlack};
  font-size: 16px;
`;  

export const LastItem = styled.div`
  
  margin-right: 40px;
`;

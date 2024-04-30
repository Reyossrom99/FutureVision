import styled from 'styled-components';
import palette from '../palette';
import { NavLink as ReactRouterNavLink } from 'react-router-dom';

export const SideNavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

export const NavContainer = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  background-color: ${palette.neutralWhite};
  border: 1px solid ${palette.neutralBlack};
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
  display: ${({ open }) => (open ? 'block' : 'none')}; /* Muestra/oculta el menú */
`;

export const TopNavLink = styled(ReactRouterNavLink)`
  color: ${palette.neutralBlack};
  text-decoration: none;
  font-size: 16px;
  margin-bottom: 10px;
  display: block;
  aling-items: center;
  padding: 8px 20px;
  transition: background-color 0.3s ease;
  border-radius: 20px;
  &:hover {
    background-color: ${palette.primary};
    color: ${palette.neutralBlack};
    border-radius: 20px;
  }
`;

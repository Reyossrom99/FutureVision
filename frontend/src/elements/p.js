import styled from 'styled-components';
import palette from '../palette';

export const Message = styled.p`
  color: ${palette.neutralBlack};
  font-size: 18px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-bottom: 20px;
  margin-top: 20px;
`;

export const Error = styled.p`
  color: ${palette.error};
  font-size: 18px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-bottom: 20px;
  margin-top: 20px;
`;


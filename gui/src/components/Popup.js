import React from 'react';
import styled from 'styled-components';
import Add from '../icons/Add';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  background: rgba(255,255,255,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(0.9);
  opacity: ${props => props.open ? '1' : '0'};
  visibility: ${props => props.open ? 'visible' : 'hidden'};  
  transform: ${props => props.open ? 'scale(1)' : 'scale(0.9)'};
  transition: all 0.15s ease-in-out;
`;

const Content = styled.div`
  max-width: 400px;
`;

const CloseBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  outline: none;
  cursor: pointer;
  position: absolute;
  top: 40px;
  right: 40px;
`;

function Popup ({ open, children }) {
  return(
    <Wrapper open={open}>
      <Content>
        {children}
      </Content>
    </Wrapper>
  );
}

export default Popup;
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Main = styled.main`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled(Link)`
  font-size: 24px;
  margin-bottom: 16px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
`;

const Header = styled.header`
  width: 100%;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
`;

function AppShell ({ children }) {
  return (
    <>
      <Header>
          <Title to="/">Holopass</Title>
      </Header>
      <Main>
        {children}
      </Main>
    </>
  );
}

export default AppShell;
import React from 'react';
import styled from 'styled-components';
import HoloBridge from '../client-api/api'
const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Form = styled.form`

`;

const Input = styled.input`
  width: 100%;
  padding: 20px;
  border: 1px solid #fff;
`;

const Button = styled.button`
  width: 100%;
  padding: 20px;
  border: 1px solid #fff;
`;

function API (props) {
  const _handleAPIclick = ()=>{
    console.log(typeof HoloBridge)
    HoloBridge.saveIdentity("tats","1234")
  }
  const _handleSaveclick = ()=>{
    console.log('save?',HoloBridge._myID);
    // HoloBridge.saveIdentity("tats","1234")
  }
  return (
    <Wrapper>
      <Title>API Tests</Title>
        <Button onClick={_handleAPIclick}>API</Button>
        <Button onClick={_handleSaveclick}>Save</Button>
     
    </Wrapper>
  );
}

export default API;
import React, { useRef } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import { withRouter } from 'react-router-dom';
import HoloBridge from '../client-api/api';

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 20px;
  font-size: 18px;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 20px;
  border-radius: 3px;
  cursor: pointer;
  background: #813cff;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

function Login ({ history }) {
  const nameInput = useRef();
  const passwordInput = useRef();
  const onSubmit = async e => {
    const nameVal = nameInput.current.value
    const passwordVal = passwordInput.current.value
    if (nameVal.length && passwordVal.length) {
      await HoloBridge.setIdentity(nameVal,passwordVal)
      history.push('/passwords')
    }    
  } 
  return (
    <AppShell>
      <Form>
        <Input placeholder="Name" required ref={nameInput} />
        <Input placeholder="Password" required ref={passwordInput} />
        <Button onClick={onSubmit}>Login</Button>
      </Form>
    </AppShell>
  );
}

export default withRouter(Login);
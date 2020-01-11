import React from 'react';
import styled from 'styled-components';

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

function Login () {
  return (
    <Wrapper>
      <Title>Login</Title>
      <Form>
        <Input placeholder="Name" />
        <Input placeholder="Password" />
        <Button>Login</Button>
      </Form>
    </Wrapper>
  );
}

export default Login;
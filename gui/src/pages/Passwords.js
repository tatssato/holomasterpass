import React, { useState } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import AddIcon from '../icons/Add';
import LinkIcon from '../icons/Link';
import LockIcon from '../icons/Lock';
import Popup from '../components/Popup';
import Add from '../icons/Add';

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const Url = styled.div`
  font-size: 40px;
`;

const Password = styled.div`
  font-size: 40px;
  display: none;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
  &:hover ${Url} {
    display: none;
  }
  &:hover ${Password} {
    display: block;
  }
`;

const Button = styled.button`
  background: #813cff;
  color: #fff;
  width: 100%;
  padding: 20px;
  border-radius: 3px;
  text-align: center;
  cursor: pointer;
  display: inline-block;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
`;

const Grid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const GridItem = styled.div`
  margin: 20px;
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

const ListText = styled.span`
  margin-left: 10px;
`;

const Form = styled.form``;

const ToggleBtn = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #813cff;
  position: absolute;
  bottom: 60px;
  right: 60px;
  z-index: 2;
  outline: none;
  cursor: pointer;
  transform: ${props => props.open && 'rotate(45deg)'};
  transition: all 0.15s ease-in-out;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 32px;
`;

const passwords = [
  {
    url: 'https://www.apple.com/',
    password: 'ADFGAFGD1324'
  },
  {
    url: 'https://www.linkedin.com/feed/',
    password: 'HGÄÖJKÖGHFÄJK657+0890'
  },
  {
    url: 'https://holochain.org/',
    password: '50678KFGLÖHJL56'
  },
  {
    url: 'https://github.com/',
    password: '34259874SDFGHÖK'
  },
  {
    url: 'https://www.apple.com/',
    password: 'ADFGAFGD1324'
  },
  {
    url: 'https://www.linkedin.com/feed/',
    password: 'HGÄÖJKÖGHFÄJK657+0890'
  },
  {
    url: 'https://holochain.org/',
    password: '50678KFGLÖHJL56'
  },
  {
    url: 'https://github.com/',
    password: '34259874SDFGHÖK'
  }
];

function Passwords () {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <AppShell>
      <Wrapper>
        <Title>Your passwords</Title>
        <List>
          {passwords.length && passwords.map((item) => (
            <ListItem>
              <LockIcon />
              <Url className='url'>                
                <ListText>{item.url}</ListText>
              </Url>
              <Password className='password'>
                <ListText>{item.password}</ListText>
              </Password>
            </ListItem>
          ))}
        </List>
      </Wrapper>
      <ToggleBtn onClick={handleOpen} open={open}>
        <Add />
      </ToggleBtn>
      <Popup open={open}>
        <Form>
          <Input placeholder="Site name (eg. github.com)" />
          <Input placeholder="Type" />
          <Input placeholder="Counter" />
          <Button>Add new password</Button>
        </Form>
      </Popup>
    </AppShell>
  );
}

export default Passwords;
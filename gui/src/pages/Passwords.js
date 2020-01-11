import React from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import AddIcon from '../icons/Add';

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const List = styled.ul`
  list-style: none;
`;

const Url = styled.span`
  font-size: 32px;
`;

const Password = styled.span`
  font-size: 32px;
  display: none;
`;

const ListItem = styled.li`
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
  return (
    <AppShell>
      <Wrapper>
        <Grid>
          <GridItem>
            <Input placeholder="Name" />
            <Input placeholder="Type" />
            <Input placeholder="Counter" />
            <Button>Add new password</Button>
          </GridItem>
          <GridItem>
            <List>
              {passwords.length && passwords.map((item) => (
                <ListItem>
                  <Url className='url'>{item.url}</Url>
                  <Password className='password'>{item.password}</Password>
                </ListItem>
              ))}
            </List>
          </GridItem>
        </Grid>
      </Wrapper>
    </AppShell>
  );
}

export default Passwords;
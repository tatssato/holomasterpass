import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
// import AddIcon from '../icons/Add';
import HoloBridge from '../client-api/api';
import { withRouter } from 'react-router';

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

function Passwords({ history }) {
  const [passDetails, setPassDetails] = useState([])
  const passNameInput = useRef()
  const typeInput = useRef()
  const counterInput = useRef()

  if (!HoloBridge._currentIDentry) {
    history.push('/')
    return null
  }

  const onSubmit = async e => {
    const passNameVal = passNameInput.current.value
    const typeVal = typeInput.current.value || 'medium'
    const counterVal = counterInput.current.value || +1
    debugger
    if (passNameVal.length) {
      const result = await HoloBridge.savePassDetailEntry(passNameVal, typeVal, +counterVal)
      setPassDetails([...passDetails, result.newPassEntry])
      console.log(`Passwords Page got result:`,result)
    }
  }
  // TODO wrap add form into an "accordian button"
  // TODO discuss when the passwds are generated (one at a time on reveal or all at once on render)
  // TODO make counter an increment widget
  // TODO make pw_typ a pulldown
  debugger
  return (
    <AppShell>
      <Wrapper>
        <Grid>
          <GridItem>
            <Input placeholder="Name" ref={passNameInput} />
            <Input placeholder="Type" ref={typeInput} />
            <Input placeholder="Counter" ref={counterInput} />
            <Button onClick={onSubmit}>Add new password</Button>

            <List>
              {passDetails.length ? passDetails.map((item) => (
                <ListItem key={`${item.name}-${item.counter}`}>
                  <Url className='url'>{item.name}</Url>
                  <Password className='password'>{HoloBridge.generatePassFromPD(item)}</Password>
                </ListItem>
              )): null }
            </List>

          </GridItem>
        </Grid>
      </Wrapper>
    </AppShell>
  );
}

export default withRouter(Passwords);
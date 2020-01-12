import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import HoloBridge from '../client-api/api';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  FormGroup,
  TextField,
  FormControl,
  Button
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2)
  },
  button: {
    fontWeight: 'bold',
    padding: theme.spacing(2)
  }
}));

function Passwords({ history }) {
  const classes = useStyles();
  const [passDetails, setPassDetails] = useState([])
  const passNameInput = useRef()
  const typeInput = useRef()
  const counterInput = useRef()

  if (!HoloBridge._currentIDentry) {
    history.push('/')
    return null
  }

  const onSubmit = async e => {
    const passNameVal = document.getElementById('passNameInput').value;
    const typeVal = document.getElementById('typeInput').value || 'medium';
    const counterVal = document.getElementById('counterInput').value || +1;
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
  return (
    <AppShell>
      <Box mx="auto" maxWidth="md">
        <Box component="form">
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              label="Site name"
              placeholder="Site name (eg. github.com)"
              required
              variant="outlined"
              fullWidth
              id="passNameInput"
            />
          </FormControl>
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              label="Type"
              placeholder="Type"
              required
              variant="outlined"
              fullWidth
              id="typeInput"
            />
          </FormControl>
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              label="Type"
              placeholder="Counter"
              required
              variant="outlined"
              fullWidth
              id="counterInput"
            />
          </FormControl>
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            fullWidth
            className={classes.button}
            >Add new password</Button>
        </Box>
        <Box>
          {passDetails.length ? passDetails.map((item, index) => (
            <Box key={`${index}-${item.counter}`}>
              <Box className='Box'>{item.name}</Box>
              <Box className='Box'>{HoloBridge.generatePassFromPD(item)}</Box>
            </Box>
          )): null }
          </Box>
      </Box>
    </AppShell>
  );
}

export default withRouter(Passwords);
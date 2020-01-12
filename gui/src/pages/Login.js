import React from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import { withRouter } from 'react-router-dom';
import HoloBridge from '../client-api/api';

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

function Login ({ history }) {
  const classes = useStyles();
  const onSubmit = async e => {
    const nameVal = document.getElementById('name').value;
    const passwordVal = document.getElementById('password').value;
    if (nameVal.length && passwordVal.length) {
      await HoloBridge.setIdentity(nameVal,passwordVal)
      history.push('/passwords')
    }    
  } 
  return (
    <AppShell>
      <Box
        component="form"
        maxWidth="400px"
        mx="auto"
        novalidate
      >
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Name"
            placeholder="Name"
            required
            variant="outlined"
            fullWidth
            id="name"
          />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Password"
            placeholder="Password"
            required 
            variant="outlined"
            fullWidth
            id="password"
          />
        </FormControl>
        <Button
          onClick={onSubmit}
          fullWidth
          variant="contained"
          color="primary"
          className={classes.button}
        >
          Login
        </Button>
      </Box>
    </AppShell>
  );
}

export default withRouter(Login);
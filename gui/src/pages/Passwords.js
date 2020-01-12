import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import CustomSelect from '../components/Select';
import HoloBridge from '../client-api/api';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  FormGroup,
  TextField,
  FormControl,
  Button,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2)
  },
  button: {
    fontWeight: 'bold',
    padding: theme.spacing(2)
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  default: {},
  hover: {
    display: 'none'
  },
  listItem: {
    display: 'flex',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
    '&:hover .hover': {
      display: 'flex'
    },
    '&:hover .default': {
      display: 'none'
    }
  },
}));

function Passwords({ history }) {
  const classes = useStyles();
  const [passDetails, setPassDetails] = useState([]);
  const [type, setType] = useState('');  

  if (!HoloBridge._currentIDentry) {
    // history.push('/')
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
  const copyPassword = e => {
    console.log('copy password to clipboard');
  }
  // TODO wrap add form into an "accordian button"
  // TODO discuss when the passwds are generated (one at a time on reveal or all at once on render)
  // TODO make counter an increment widget
  // TODO make pw_typ a pulldown
  return (
    <AppShell>
      <Box mx="auto" maxWidth="md">
        <Box component="form" mb={4}>
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
              label="Counter"
              placeholder="Counter"
              required
              variant="outlined"
              fullWidth
              id="typeInput"
              type="number"
            />
          </FormControl>
          <CustomSelect onChange={(type) => setType(type)} value={type} />
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
            <Box className={classes.listItem} onClick={copyPassword}>
              <Box key={`${index}-${item.counter}`} display="flex" alignItems="center" className={`${classes.default} default pass-item`}>
                <VisibilityOutlinedIcon fontSize="large" className={classes.icon} />
                <Typography variant="h4">{item.name}</Typography>
              </Box>
              <Box display="flex" alignItems="center" className={`${classes.hover} hover pass-item`}>
                <FileCopyOutlinedIcon fontSize="large" className={classes.icon} />
                <Typography variant="h4">{HoloBridge.generatePassFromPD(item)}</Typography>
              </Box>
            </Box>
          )): null}
        </Box>
      </Box>
    </AppShell>
  );
}

export default withRouter(Passwords);
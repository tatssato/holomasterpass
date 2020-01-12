import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import AppShell from '../components/AppShell';
import CustomSelect from '../components/Select';
import HoloBridge, { MasterPassUtils } from '../client-api/api';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import {
  Box,
  Fab,
  Typography,
  FormGroup,
  TextField,
  FormControl,
  Button,
  MenuItem,
  InputLabel,
  Card,
  List,
  ListItem
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
  list: {
    width: '100%',
  },
  outerBox: {
    width: '100%',
    maxWidth: 600,
    margin:0,
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

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function Passwords({ history }) {
  console.log('Rendering Passwords with:')
  // HOOKS must come before any conditional rendering
  const classes = useStyles()
  const [passDetails, setPassDetails] = useState(HoloBridge._initialPassDetails || [])
  const [type, setType] = useState('medium')
  const [currentlyDisplayedPass, setDisplayPass] = useState(undefined)
  const [isAddNewOpen, showAddNew] = useState(!passDetails.length)

  console.log(`Rendering Passwords with ${passDetails.length} passDetails`)
  console.log(`passDetails is HoloBridge._initialPassDetails? ${!!(passDetails === HoloBridge._initialPassDetails)}`, HoloBridge._initialPassDetails)

  // useEffect(() => {
  //   const callGetAllPassDetails = async function () {
  //     const result = await HoloBridge.getAllPassDetails()
  //     console.log(result)
  //     return result
  //   }
  //   const uptoDatePassDetails = callGetAllPassDetails()
  //   console.log('useEffect fetched passDetails', uptoDatePassDetails)
  //   setPassDetails(uptoDatePassDetails)
  // }, HoloBridge._initialPassDetails || [])

  // if we don't know who we are - go back and find out (Login)
  if (!HoloBridge._currentMasterKey) {
    history.push('/')
    return null
  }

  const onSubmit = async e => {
    const passNameVal = document.getElementById('passNameInput').value;
    const counterVal = document.getElementById('counterInput').value || +1;
    if (passNameVal.length) {
      const { newAddress, newPassDetailEntry, allPassDetails } = await HoloBridge.savePassDetailEntry(passNameVal, type, +counterVal)
      setPassDetails(allPassDetails)
      console.log(`Passwords Page got result:`, newAddress)
      console.log('All passDetails:', allPassDetails)
    }
  }
  const copyPassword = e => {
    console.log('copy password to clipboard');
    copyToClipboard(currentlyDisplayedPass);
    setTimeout(() => setDisplayPass(undefined), 5000)
  }
  const revealPassword = passDetailOM => {
    const freshPassword = MasterPassUtils.generatePassFromPD(passDetailOM)
    // console.log(freshPassword)
    setDisplayPass(freshPassword)
  }
  // TODO wrap add form into an "accordian button"
  // TODO discuss when the passwds are generated (one at a time on reveal or all at once on render)
  // TODO make counter an increment widget
  // TODO make pw_typ a pulldown
  return (
    <AppShell>
      <Box className={classes.outerBox} mx="auto" maxWidth="md">
        {isAddNewOpen ? (<Box component="form" mb={4}>
          <FormControl fullWidth className={classes.formControl}>
            <TextField
              onKeyPress={ev => ev.key === 'Enter' && onSubmit()}
              autoFocus
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
              defaultValue={1}
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
        ) : (
            <Fab color="primary" aria-label="add" onClick={showAddNew}>
              <AddIcon />
            </Fab>
          )}
        <List className={classes.list}>
          {passDetails.length ? passDetails.map((item, index) => (
            <ListItem key={`${index}-${item.counter}`} className={classes.listItem} onClick={copyPassword}>
              <Box display="flex" alignItems="center" className={`${classes.default} default pass-item`}>
                <VisibilityOutlinedIcon fontSize="large" className={classes.icon} />
                <Typography variant="h4">{item.name}</Typography>
              </Box>
              <Card onMouseEnter={() => revealPassword(item)} display="flex" className={`${classes.hover} hover pass-item`}>
                <FileCopyOutlinedIcon fontSize="large" className={classes.icon} />
                <Typography variant="h4">{currentlyDisplayedPass || '* * * * * *'}</Typography>
              </Card>
            </ListItem>
          )) : null}
        </List>
      </Box>
    </AppShell>
  );
}

export default withRouter(Passwords);
import React, { useState } from 'react';
import AppShell from '../components/AppShell';
import CustomSelect from '../components/Select';
import HoloBridge, { MasterPassUtils } from '../client-api/api';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
  Box,
  Fab,
  Typography,
  TextField,
  FormControl,
  Button,
  Card,
  List,
  ListItem
} from '@material-ui/core';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

const useStyles = makeStyles(theme => ({
  h4: {
    display: 'inline-block'
  },
  formControl: {
    marginBottom: theme.spacing(1),
    background: 'white',
    opacity: 0.85,
  },
  button: {
    fontWeight: 'bold',
    padding: theme.spacing(1)
  },
  icon: {
    marginRight: theme.spacing(1),
    float: 'left',
    margin: '5px 8px',
  },
  delete_icon: {
    color: 'red',
    float: 'right',
    margin: 4,
  },
  default: {},
  hover: {
    display: 'block',
    position: 'absolute',
    left: 0,
    right: 0,
    width: 'unset',
    transform: 'rotate3d(1, 0, 0, 90deg)',
    transition: 'all 0.3s ease-in 0.6s',
  },
  list: {
    width: '100%',
  },
  outerBox: {
    width: '100%',
    maxWidth: 600,
    margin:0,
  },
  listpassDetailOM: {
    display: 'flex',
    width: '100%',
    cursor: 'pointer',
    marginBottom: 0,
    '&:hover .hover': {
      transform: 'rotate3d(1, 0, 0, 0deg)',
    },
    '&:hover .default': {
      transform: 'rotate3d(1, 0, 0, -90deg)',
    }
  },
  card: {
    transition: 'all 0.3s ease-in',
    width: '100%',
  },
  addNew: {
    top: 0,
    left: '2%',
    position: 'absolute',
    width: '90%',
    padding: 12,
    background: 'rgba(255,255,255,0.8)'
  },
}));

const copyToClipboard = str => {
  console.log(`copying: ${str}`);
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    // unsuccessful when trying to (clear the clipboard in a timeout 
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    
  }
  document.body.removeChild(el);
};

function Passwords({ history }) {
  console.log('Rendering Passwords with:')
  // HOOKS must come before any conditional rendering
  const classes = useStyles()
  const [passDetails, setPassDetails] = useState(HoloBridge.current.PassDetailsMap ? Array.from(HoloBridge.current.PassDetailsMap.values()) : [])
  const [type, setType] = useState('medium')
  const [currentlyDisplayedPass, setDisplayPass] = useState(undefined)
  const [isAddNewOpen, showAddNew] = useState(!passDetails.length)


  console.log(`Rendering Passwords with ${passDetails.length} passDetails, full Map:`, HoloBridge.current.PassDetailsMap)

  // if we don't know who we are - go back and find out (Login)
  if (!HoloBridge.current.MasterKey) {
    history.push('/')
    return null
  }

  const onSubmit = async e => {
    const passNameEl = document.getElementById('passNameInput')
    const passNameVal = passNameEl.value
    passNameEl.blur()
    const counterVal = document.getElementById('counterInput').value || +1
    if (passNameVal.length) {
      const { allPassDetails } = await HoloBridge.savePassDetailEntry(passNameVal, type, +counterVal)
      setPassDetails(allPassDetails)
      console.log('Passwords Page got result: allPassDetails:', allPassDetails)
    }
  }
  const deleteEntry = async passDetailOM => {
    const allPassDetails = await HoloBridge.deletePassDetailEntry(passDetailOM.hc_address)
    setPassDetails(allPassDetails)
  }
  const revealPassword = passDetailOM => {
    const freshPassword = MasterPassUtils.generatePassFromPD(passDetailOM)
    setDisplayPass(freshPassword)
    setTimeout(() => copyToClipboard('---') || setDisplayPass(undefined), 5000)
    return freshPassword
  }
  const copyPassword = passDetailOM => {
    console.log('copy password to clipboard')
    copyToClipboard(revealPassword(passDetailOM))
  }
  
  // TODO discuss when the passwds are generated (one at a time on reveal or all at once on render)
  //       Currently each password is only created and rendered onMouseEnter of the ListpassDetailOM
  return (
    <AppShell>
      <Box className={classes.outerBox} mx="auto" maxWidth="md">
        {isAddNewOpen ? (<Card className={classes.addNew} component="form" mb={4}>
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
          <FormControl fullWidth className={classes.formControl}>
            <CustomSelect onChange={(type) => setType(type)} value={type} />
          </FormControl>
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            fullWidth
            className={classes.button}
          >Add new password</Button>
        </Card>
        ) : (
            <Fab color="primary" aria-label="add" onClick={showAddNew}>
              <AddIcon />
            </Fab>
          )}
        <List className={classes.list}>
          {passDetails.length ? passDetails.map((passDetailOM, index) => (
            <ListItem key={`${index}-${passDetailOM.counter}`} className={classes.listpassDetailOM}>
              <Card display="flex"  className={`${classes.default} ${classes.card} default pass-passDetailOM`}>
                <VisibilityOutlinedIcon fontSize="large" className={classes.icon} />
                <Typography variant="h4">{passDetailOM.name}</Typography>
                 </Card>
              <Card display="flex" className={`${classes.card}  ${classes.hover} hover pass-passDetailOM`}>
                <FileCopyOutlinedIcon onClick={() =>  copyPassword(passDetailOM)} fontSize="large" className={classes.icon} />
                <Typography onClick={() =>  revealPassword(passDetailOM)} className={classes.h4} variant="h4">{currentlyDisplayedPass || '* * * * * *'}</Typography>
                <DeleteForeverIcon onClick={mEv=>deleteEntry(passDetailOM)} fontSize="large" className={classes.delete_icon}/>
              </Card>
            </ListItem>
          )) : null}
        </List>
      </Box>
    </AppShell>
  );
}

  export default withRouter(Passwords);
import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';


const useStyles = makeStyles({
  main: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '16px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
  }
});

function AppShell ({ children }) {
  console.log('Rendering AppShell')
  const classes = useStyles();
  return (
    <>
      <Box width='100%' p={2} position='fixed'>
        <Link to="/" className={classes.title}>Holopass</Link>
      </Box>
      <Box className={classes.main}>
        {children}
      </Box>
    </>
  );
}

export default AppShell;
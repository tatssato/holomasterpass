import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  FormControl,
  MenuItem,
  InputLabel
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2)
  }
}));

function CustomSelect (props) {
  const classes = useStyles();
  const inputLabel = useRef(null);
  const [labelWidth, setLabelWidth] = useState(0);

  useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);

  const handleChange = event => {
    if (typeof props.onChange === 'function')
      props.onChange(event.target.value);
  };
  return (
    <FormControl variant="outlined" className={classes.formControl} fullWidth>
      <InputLabel id="type-select">
        Type
      </InputLabel>
      <Select
        labelId="type-select"
        id="demo-simple-select-outlined"
        value={props.value}
        onChange={handleChange}
        labelWidth={labelWidth}
        ref={inputLabel}
        id="counterInput"
      >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      <MenuItem value="weak">Weak</MenuItem>
      <MenuItem value="medium">Medium</MenuItem>
      <MenuItem value="strong">Strong</MenuItem>
    </Select>
  </FormControl>
  );
}

export default CustomSelect;
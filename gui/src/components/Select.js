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
// from: https://github.com/Cretezy/MasterPassX/blob/fbe9a7693a19fcbd3ed07ae887b240769b32a9a7/core/src/index.js#L6
const typeOptions = {
  maximum: "Maximum",
	long: "Long",
	medium: "Medium",
	basic: "Basic",
	short: "Short",
	pin: "PIN",
	name: "Name",
	phrase: "Phrase"
}
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
        defaultValue={typeOptions.medium}
        value={props.value}
        onChange={handleChange}
        labelWidth={labelWidth}
        ref={inputLabel}
        id="counterInput"
      >
     
      {Object.keys(typeOptions).map(typeString=>(
        <MenuItem key={typeString} value={typeString}>{typeString}</MenuItem>
      ))}
    </Select>
  </FormControl>
  );
}

export default CustomSelect;
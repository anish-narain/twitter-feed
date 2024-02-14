/*
Fetch bird labels from database
*/

import React, { useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useUser } from './UserContext';

function BirdSelector({ onSelectBird  }) {
  const [birdLabels, setBirdLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');
  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number} = userDetails

  useEffect(() => {
    // Fetch bird labels from your backend
    fetch(`http://localhost:5001/unique-bird-labels/${serial_number}`)
      .then(response => response.json())
      .then(data => {
        setBirdLabels(data); 
      })
      .catch(error => console.error('Error fetching bird labels:', error));
  }, []);

  const handleLabelChange = (event) => {
    setSelectedLabel(event.target.value);
    onSelectBird(event.target.value); // Notify parent component of the new selection
  };

  return (
    <Select
      labelId="bird-label-select-label"
      id="bird-label-select"
      value={selectedLabel}
      onChange={handleLabelChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
    >
      <MenuItem value="" disabled>Choose your bird!</MenuItem>
      {birdLabels.map((label, index) => (
        <MenuItem key={index} value={label}>{label}</MenuItem>
      ))}
    </Select>
  );
}

export default BirdSelector;

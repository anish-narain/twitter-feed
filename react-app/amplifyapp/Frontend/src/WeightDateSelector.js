/*
A Date Selector for Food Alert Page
*/

import React from 'react';

const WeightDateSelector = ({ onSelectDate }) => {
  const handleDateChange = (event) => {
    onSelectDate(event.target.value);
  };

  return (
    <input type="date" onChange={handleDateChange} />
  );
};

export default WeightDateSelector;

import React from 'react';

const DateSelector = ({ onSelectDate }) => {
  const handleDateChange = (event) => {
    onSelectDate(event.target.value);
  };

  return (
    <input type="date" onChange={handleDateChange} />
  );
};

export default DateSelector;
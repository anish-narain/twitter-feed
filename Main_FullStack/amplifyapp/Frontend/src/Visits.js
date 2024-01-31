import React from 'react';
import Typography from '@mui/material/Typography';
import Title from './Title';
import { useSelectedDate } from './SelectedDateContext'; // Import the context hook

export default function Visits() {
  const { selectedDate } = useSelectedDate(); // Use the selected date from context

  const currentDateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // Use selectedDate or default to current date if null
  const currentDate = selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, currentDateOptions) : new Date().toLocaleDateString(undefined, currentDateOptions);
  const QueryDate = selectedDate 
    ? new Date(selectedDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];


  return (
    <React.Fragment>
      <Title>Number of Bird Detections</Title>
      <Typography component="p" variant="h4">
        5
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on {currentDate}
      </Typography>
    </React.Fragment>
  );
}

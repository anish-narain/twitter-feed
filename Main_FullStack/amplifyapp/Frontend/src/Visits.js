import * as React from 'react';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

export default function Deposits() {

  const currentDateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const currentDate = new Date().toLocaleDateString(undefined, currentDateOptions);

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

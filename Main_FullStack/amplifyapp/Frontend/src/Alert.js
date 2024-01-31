import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function Alert({ showAlert, foodPercentage }) {
  return (
    <Paper elevation={3} style={{ padding: '16px', maxWidth: '300px' }}>
      {showAlert ? (
        <div>
          <p>Food is running low!</p>
          <p>Food Percentage: {foodPercentage.toFixed(2)}%</p>
        </div>
      ) : (
        <div>
          <Typography variant="h6">Food supply is sufficient.</Typography>
          <Typography variant="body1">
            You have enough food for your birds.
          </Typography>
        </div>
      )}
    </Paper>
  );
}

export default Alert;

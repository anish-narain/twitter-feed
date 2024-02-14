/*
This conditionally renders a dashboard with charts, visit statistics, and bird history, 
except on the Bird Trends and Food Alerts pages.
*/


import React from 'react';
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from './Chart';
import Visits from './Visits';
import BirdHistory from './BirdHistory';

function ConditionalComponents() {
  const location = useLocation();

  if (location.pathname === "/BirdTrendsPage" || location.pathname === "/FoodAlertsPage") {
    return null; // Don't render anything if on Bird Trends page
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8} lg={9}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
          <Chart />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
          <Visits />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <BirdHistory />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ConditionalComponents;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid'; // Add Grid import
import Paper from '@mui/material/Paper'; // Add Paper import
import FoodChart from './FoodChart'; // Import your chart component
import Alert from './Alert'; // Import your alert component

// Define a default theme
const defaultTheme = createTheme();

function Dashboard({ signOut }) {
  // Simulated food data (you should replace this with actual data)
  const [foodPercentage, setFoodPercentage] = useState(75); // Example: 75% remaining

  useEffect(() => {
    // Simulated data update (e.g., fetching data from a server)
    const interval = setInterval(() => {
      // Update foodPercentage with new data
      const newData = Math.random() * 100; // Replace with actual data
      setFoodPercentage(newData);
    }, 60000); // Update every minute (adjust as needed)

    return () => {
      clearInterval(interval); // Cleanup on unmount
    };
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Food Alerts
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Food Percentage
                  </Typography>
                  <Typography variant="body1">
                    {foodPercentage.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
              <FoodChart />
            </Grid>
          </Grid>
          <Alert threshold={25} foodPercentage={foodPercentage} /> {/* Render your alert component */}
          {/* Add more content and components as needed */}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Dashboard);

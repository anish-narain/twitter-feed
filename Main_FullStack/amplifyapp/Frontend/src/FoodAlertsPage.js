import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// Define a default theme
const defaultTheme = createTheme();

function Dashboard({ signOut }) {
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
          <Typography variant="body1">
            This is a simple page example.
          </Typography>
          {/* Add more content here */}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Dashboard);

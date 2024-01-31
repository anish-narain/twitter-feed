import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Define a default theme
const defaultTheme = createTheme();

// Sample data for bird types
const birdTypes = [
  {
    name: 'Sparrow',
    preferredTemperature: '20-25°C',
    preferredTime: 'Morning',
    image: 'sparrow.jpg', // Add image URL here
  },
  {
    name: 'Blue Jay',
    preferredTemperature: '18-22°C',
    preferredTime: 'Daytime',
    image: 'blue_jay.jpg', // Add image URL here
  },
  // Add more bird types as needed
];

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
            Bird Trends
          </Typography>
          <Typography variant="body1">
            Bird Trends
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bird Type</TableCell>
                  <TableCell>Preferred Temperature</TableCell>
                  <TableCell>Preferred Time</TableCell>
                  <TableCell>Picture</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {birdTypes.map((bird, index) => (
                  <TableRow key={index}>
                    <TableCell>{bird.name}</TableCell>
                    <TableCell>{bird.preferredTemperature}</TableCell>
                    <TableCell>{bird.preferredTime}</TableCell>
                    <TableCell>
                      <img
                        src={bird.image}
                        alt={bird.name}
                        style={{ width: '100px', height: 'auto' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default withAuthenticator(Dashboard);

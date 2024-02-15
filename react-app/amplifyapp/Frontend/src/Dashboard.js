/*
Main Dashboard Page:
1. Show for bird detection chart across 3 hour ranges
2. Show all bird images with predicted labels within selected date
3. Main page and handle connect and log out
4. Manage to get and send userId and Serial number from AWS amplify authenticator to database
*/

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "@aws-amplify/ui-react/styles.css";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import {signOut } from 'aws-amplify/auth';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Tab, Tabs } from '@mui/material'; // Import Tabs and Tab components
import logo from './logo.png';
import BirdTrendsPage from './BirdTrendsPage'; // Replace with actual file name
import FoodAlertsPage from './FoodAlertsPage'; // Replace with actual file name
import ConditionalComponents from './ConditionalComponents'; // Import the new component
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useUser } from './UserContext';



const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(9),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(14),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme({
  typography: {
    fontFamily: "'Lilita One', cursive",
  },
});



const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
    },
  },
  signUp: {
    username: {
      label: 'Username',
      placeholder: 'Enter you Username',
      isRequired: true,
      order: 1,
    },
    password: {
      label: 'Password:',
      placeholder: 'Enter your Password:',
      isRequired: true,
      order: 2,
    },
    confirm_password: {
      label: 'Confirm Password:',
      placeholder: 'Confirm your Password:',
      isRequired: true,
      order: 3,
    },
    email: {
      label: 'Email',
      placeholder: 'Enter your Email:',
      isRequired: true,
      order: 4,
    },
    nickname: {
      label: 'Bird Feeder Serial Number:',
      placeholder: 'Enter Serial Number:',
      isRequired: true,
      order: 5,
    },
  },

};


function Dashboard() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(0);
  const { userDetails, setUserDetails } = useUser();
  const toggleDrawer = () => setOpen(!open);
  const handleChange = (event, newValue) => setValue(newValue);

  const handleSignIn = async () => {
    try {
      // refresh the page after sign in for updating serial_number using Connect Button
      window.location.reload();
    } catch (error) {
      console.error('Error signing in: ', error);
    }
  };

  const handleSignOut = async () => {
    // when clicking signout button, clear current serial_number and userId to null
    try {
      const userDetails = {
        userId: null,
        serial_number: null,
      };
      setUserDetails(userDetails)

      await fetch('http://ec2-3-85-198-193.compute-1.amazonaws.com:5001/user-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });

      // sign out
      await signOut();
    } catch (error) {
      console.error('Error signing in: ', error);
    }
  };


  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        // get username and userId from authenticator
        const { username, userId, signInDetails } = await getCurrentUser();
        
        // get serial_number stored under nickname from authenticator
        const attributes1 = await fetchUserAttributes();
        const serial_number = attributes1.nickname; 

        if (serial_number) {
          const userDetails = {
            userId: username,
            serial_number: attributes1.nickname, 
          };
          setUserDetails(userDetails)

          // Send the userID, serial_number to the server
          await fetch('http://ec2-3-85-198-193.compute-1.amazonaws.com:5001/user-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetails),
          });
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchCurrentUser();
  }, []);


  return (
    <Authenticator formFields={formFields}>
      {({ signOut, user }) => (
        <ThemeProvider theme={defaultTheme}>
          <Router> 
            <Box sx={{ display: 'flex' }}>
              <CssBaseline />
              <AppBar position="absolute" open={open}>
                <Toolbar
                  sx={{
                    pr: '24px',
                  }}
                >
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    sx={{
                      marginRight: '36px',
                      ...(open && { display: 'none' }),
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    component="h1"
                    variant="h6"
                    color="inherit"
                    noWrap
                    sx={{ flexGrow: 1 }}
                  >
                    <img src={logo} style={{ height: '60px', marginRight: '5px', marginTop: '5px' }} />
                  </Typography>
                  <Typography
                    variant="body1"
                    color="inherit"
                    noWrap
                    sx={{ marginRight: '20px' }}
                  >
                    {userDetails?.serial_number ? userDetails.userId : 'Not Connected'}
                  </Typography>
                  <Button color="inherit" onClick={handleSignIn}>Connect</Button>
                  <IconButton color="inherit" onClick={signOut}></IconButton>
                  <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
                </Toolbar>
              </AppBar>
              <Drawer variant="permanent" open={open}>
                <Toolbar
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                  }}
                >
                  <IconButton onClick={toggleDrawer}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Toolbar>
                <Divider />
                <Tabs
                  value={value}
                  onChange={handleChange}
                  orientation="vertical"
                  variant="scrollable"
                >
                  <Tab label="Dashboard" component={Link} to="/Dashboard" />
                  <Tab label="Bird Trends" component={Link} to="/BirdTrendsPage" />
                  <Tab label="Food Alerts" component={Link} to="/FoodAlertsPage" />
                  
                </Tabs>
              </Drawer>
              <Box
                component="main"
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[100]
                      : theme.palette.grey[900],
                  flexGrow: 1,
                  height: '100vh',
                  overflow: 'auto',
                }}
              >
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                  <ConditionalComponents />
                  <Routes>
                    <Route path="/BirdTrendsPage" element={<BirdTrendsPage />} />
                    <Route path="/FoodAlertsPage" element={<FoodAlertsPage />} />
                  </Routes>
                </Container>
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                </Container>
              </Box>
            </Box>
          </Router>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}
export default Dashboard;

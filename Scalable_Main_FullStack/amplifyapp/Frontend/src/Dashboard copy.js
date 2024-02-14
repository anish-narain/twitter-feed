import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "@aws-amplify/ui-react/styles.css";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import { signIn, signOut } from 'aws-amplify/auth'; 
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { Auth } from 'aws-amplify';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Tab, Tabs } from '@mui/material'; // Import Tabs and Tab components
import Chart from './Chart';
import Visits from './Visits';
import logo from './logo.png';
import BirdHistory from './BirdHistory';
import BirdTrendsPage from './BirdTrendsPage'; // Replace with actual file name
import FoodAlertsPage from './FoodAlertsPage'; // Replace with actual file name
import FlutterDashIcon from '@mui/icons-material/FlutterDash';
import ConditionalComponents from './ConditionalComponents'; // Import the new component
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'; 
import { UserProvider } from './UserContext'; // Import UserProvider
import { useUser } from './UserContext';



const drawerWidth = 240;

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

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
  // ... other theme settings
});



const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
    },
  },
  signUp: {
    username:{
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
  // Existing Dashboard state and functions
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(0);
  const { userDetails, setUserDetails } = useUser();
  const toggleDrawer = () => setOpen(!open);
  const handleChange = (event, newValue) => setValue(newValue);

  const handleSignIn = async () => {
    try {
      
      await signIn(); // Assuming this is a placeholder for your actual sign-in logic
      window.location.reload();
      //setIsSignedIn(true); // Update state to reflect sign-in
       // Refresh the page after successful sign in
    } catch (error) {
      console.error('Error signing in: ', error);
    }
  };

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const { username, userId, signInDetails } = await getCurrentUser();

        const attributes1 = await fetchUserAttributes();
        const serial_number = attributes1.nickname; // assuming email is required by fetchUserAttributes()

        if (serial_number) {
        const userDetails = {
          userId: userId,
          serial_number: attributes1.nickname, // assuming email is required by fetchUserAttributes()
          //email: attributes1.email
          // other attributes as needed
        };
        setUserDetails(userDetails)

        //setUserDetails({ username, userId, signInDetails }); // This will now correctly update the state
        // Send the userId to the server
        await fetch('http://localhost:5001/user-details', {
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
        //handleSignIn(),
    <ThemeProvider theme={defaultTheme}>
      <Router> {/* Move Router to wrap the entire app */}
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
                <img src={logo} style={{ height: '60px', marginRight: '5px' ,  marginTop: '5px'}} />
              </Typography>
              <Button color="inherit"onClick={handleSignIn}>Connect</Button>
              <IconButton color="inherit" onClick={signOut}></IconButton>
              <Button color="inherit" onClick={signOut}>Sign Out</Button>
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
              {/* Add more tabs as needed */}
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
              <ConditionalComponents /> {}
              <Routes>
                <Route path="/BirdTrendsPage" element={<BirdTrendsPage />} />
                <Route path="/FoodAlertsPage" element={<FoodAlertsPage />} />
                {}
              </Routes>
            </Container>
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            </Container>
          </Box>
        </Box>
      </Router> {}
      </ThemeProvider>
      )}
    </Authenticator>
  );
}
 export default Dashboard;

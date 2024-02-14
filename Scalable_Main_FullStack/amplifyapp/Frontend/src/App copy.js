import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'; 
import Dashboard from './Dashboard';
import { SelectedDateProvider } from './SelectedDateContext';

function App() {
  // Corrected useState to capture both state and its updater function
  const [userDetails, setUserDetails] = useState({ username: '', userId: '', signInDetails: '' });

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const { username, userId, signInDetails } = await getCurrentUser();

        const attributes1 = await fetchUserAttributes();
        const attributes = {
          userId: userId,
          serial_number: attributes1.nickname, // assuming email is required by fetchUserAttributes()
          //email: attributes1.email
          // other attributes as needed
        }

        //setUserDetails({ username, userId, signInDetails }); // This will now correctly update the state
        // Send the userId to the server
        await fetch('http://localhost:5001/user-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attributes),
        });
      } catch (err) {
        console.log(err);
      }
    }

    fetchCurrentUser();
  }, []);

  return (
    <SelectedDateProvider>
      <Dashboard />
    </SelectedDateProvider>
  );
}

export default App;

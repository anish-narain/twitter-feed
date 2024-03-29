/*
Top Level Web App Code
*/

import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'; 
import Dashboard from './Dashboard';
import { SelectedDateProvider } from './SelectedDateContext';
import { UserProvider } from './UserContext'; // Import UserProvider

function App() {  

  return (
      <SelectedDateProvider>
        <UserProvider>
        <Dashboard />
        </UserProvider>
      </SelectedDateProvider>
  );
}

export default App;

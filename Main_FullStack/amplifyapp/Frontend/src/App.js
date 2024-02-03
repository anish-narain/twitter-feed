import React, { useState } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator, Button } from "@aws-amplify/ui-react";
import Dashboard from './Dashboard'; 
import { SelectedDateProvider } from './SelectedDateContext'; // Import the provider

export default withAuthenticator(function App() {
  return (
    <SelectedDateProvider>
      <Dashboard />
    </SelectedDateProvider>
  );
});

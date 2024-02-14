// SelectedDateContext.js
import React, { createContext, useContext, useState } from 'react';

const SelectedDateContext = createContext();

export const useSelectedDate = () => useContext(SelectedDateContext);

export const SelectedDateProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </SelectedDateContext.Provider>
  );
};

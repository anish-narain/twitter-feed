import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Title from './Title';
import { useSelectedDate } from './SelectedDateContext'; // Import the context hook
import { useUser } from './UserContext';

export default function Visits() {
  const { selectedDate } = useSelectedDate(); // Use the selected date from context
  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number} = userDetails

  const currentDateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // Use selectedDate or default to current date if null
  const currentDate = selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, currentDateOptions) : new Date().toLocaleDateString(undefined, currentDateOptions);
  const QueryDate = selectedDate 
    ? new Date(selectedDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  const [count, setCount] = useState(null);

  useEffect(() => {
    // Fetch the count for QueryDate from your API
    async function fetchCount() {
      try {
        const response = await fetch(`http://localhost:5001/bird_detect_single_date/${serial_number}/${QueryDate}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCount(data.birdDetectionsCount); // Assuming your API returns the count
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    }

    fetchCount();
  }, [QueryDate]);


  return (
    <React.Fragment>
      <Title>Number of Bird Detections</Title>
      <Typography component="p" variant="h4">
        {count}
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        on {currentDate}
      </Typography>
    </React.Fragment>
  );
}

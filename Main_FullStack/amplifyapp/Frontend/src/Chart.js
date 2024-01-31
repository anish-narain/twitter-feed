import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, XAxis, YAxis, Tooltip, axisClasses } from '@mui/x-charts'; 
import Title from './Title';
import { useSelectedDate } from './SelectedDateContext'; // Import the context hook

function createData(time, count) {
  return { time, count };
}

export default function Chart() {
  const { selectedDate } = useSelectedDate(); // Use the selected date from context

  const currentDateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  // Use selectedDate or default to current date if null
  //const currentDate = selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, currentDateOptions) : new Date().toLocaleDateString(undefined, currentDateOptions);
  const QueryDate = selectedDate 
    ? new Date(selectedDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  const theme = useTheme();
  const [data, setData] = useState([]); // Ensure data is initialized to an empty array

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/bird_detect_haha/${QueryDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        if (json.birdDetectionsByBlock) {
          setData(Object.entries(json.birdDetectionsByBlock).map(([time, count]) => createData(time, count)));
        } else {
          console.error('Unexpected response structure:', json);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [selectedDate]); // Include selectedDate in the dependency array
  

  // Calculate the maximum count for dynamic Y-axis scaling
  const maxYValue = data.reduce((max, item) => item.count > max ? item.count : max, 0);


  // Conditional rendering: Render chart only if data is available
  if (data.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <React.Fragment>
      <Title>Today</Title>
      <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        <BarChart
          dataset={data}
          margin={{
            top: 16,
            right: 20,
            left: 70,
            bottom: 30,
          }}
          xAxis={[
            {
              scaleType: 'band',
              dataKey: 'time',
              tickNumber: 2,
              tickLabelStyle: theme.typography.body2,
            },
          ]}
          yAxis={[
            {
              label: 'Bird Detections',
              labelStyle: {
                ...theme.typography.body1,
                fill: theme.palette.text.primary,
              },
              tickLabelStyle: theme.typography.body2,
              max: maxYValue + 1, // Adjusted to fit data
              min: 0,
              tickNumber: 3,
            },
          ]}
          series={[
            {
              dataKey: 'count',
              showMark: false,
              color: theme.palette.primary.light,
            },
          ]}
          sx={{
            [`.${axisClasses.root} line`]: { stroke: theme.palette.text.secondary },
            [`.${axisClasses.root} text`]: { fill: theme.palette.text.secondary },
            [`& .${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translateX(-25px)',
            },
          }}
        />
      </div>
    </React.Fragment>
  );
}
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'; // Using recharts for simplicity
import Title from './Title';

function BirdTemperatureTrendChart({ selectedBird }) {
  const theme = useTheme();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Adjust the endpoint URL and parameters as needed to match your API
        const response = await fetch(`http://localhost:5001/bird_temperature_trend/${selectedBird}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData); // Assuming the API returns data in the correct format
      } catch (error) {
        console.error('Failed to fetch bird temperature trend data:', error);
      }
    };

    if (selectedBird) {
      fetchData();
    }
  }, [selectedBird]); // Re-fetch data when selectedBird changes

  if (data.length === 0) {
    return <div>No data available for {selectedBird}.</div>;
  }

  return (
    <React.Fragment>
      <Title>Temperature Trend for {selectedBird}</Title>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="temperature" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="detections" fill={theme.palette.primary.main} name="Detections" />
      </BarChart>
    </React.Fragment>
  );
}

export default BirdTemperatureTrendChart;

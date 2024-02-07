import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import Title from './Title';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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
    <Card>
      <CardContent>
        <Title>Temperature Trend for {selectedBird}</Title>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <XAxis dataKey="temperature" type="number" domain={['auto', 'auto']} label={{ value: 'Temperature (in degrees Celsius)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Bird Detections', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="detections" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default BirdTemperatureTrendChart;

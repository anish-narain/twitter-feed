/*
Create Bird Temperature Trend Chart against number of detections
*/

import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import Title from './Title';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useUser } from './UserContext';

function BirdTemperatureTrendChart({ selectedBird, onMaxTemperatureRange }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number} = userDetails

  // Function to process and bin the temperature data
  function processTemperatureData(jsonData) {
    const temperatures = jsonData.map(item => parseFloat(item.temperature));
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const numBins = Math.ceil(Math.sqrt(temperatures.length)); // Number of bins based on square root heuristic
    const binSize = (maxTemp - minTemp) / numBins;
    const bins = {};
    
  
    jsonData.forEach(item => {
      const binIndex = Math.floor((parseFloat(item.temperature) - minTemp) / binSize);
      const binKey = `${(minTemp + binIndex * binSize).toFixed(1)}-${(minTemp + (binIndex + 1) * binSize).toFixed(1)}`;
  
      if (!bins[binKey]) {
        bins[binKey] = { temperature: binKey, detections: 0 };
      }
      bins[binKey].detections += item.detections;
    });
  
    // Convert object values to array and sort based on the starting temperature of each bin
    return Object.values(bins).sort((a, b) => {
      const aMinTemp = parseFloat(a.temperature.split('-')[0]);
      const bMinTemp = parseFloat(b.temperature.split('-')[0]);
      return aMinTemp - bMinTemp;
    });
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/bird_temperature_trend/${serial_number}/${selectedBird}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(processTemperatureData(jsonData));
      } catch (error) {
        console.error('Failed to fetch bird temperature trend data:', error);
      }
    };

    if (selectedBird) {
      fetchData();
    }
  }, [selectedBird]);

  useEffect(() => {
    if (data.length > 0) {
      const maxTempRange = data.reduce((max, item) => max.detections > item.detections ? max : item, data[0]);
      // Call the callback with the maxTempRange
      onMaxTemperatureRange(maxTempRange.temperature);
    }
  }, [data]);

  if (data.length === 0) {
    return <div>No data available for {selectedBird}.</div>;
  }

  return (
    <Card>
      <CardContent>
        <Title>Temperatures Trend for {selectedBird}</Title>
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
            <XAxis dataKey="temperature" label={{ value: 'Temperature Range (in degrees Celsius)', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Bird Detections', angle: -90, position: 'insideLeft', dy: 50 }} />
            <Tooltip />
            <Bar dataKey="detections" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default BirdTemperatureTrendChart;

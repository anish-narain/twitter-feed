import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Cell } from 'recharts';
import Title from './Title';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

function BirdTimeTrendChart({ selectedBird, onMaxTimeOfDay }) {
  const theme = useTheme();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/bird_time_trend/${selectedBird}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        const processedData = processTimeData(jsonData);
        setData(processedData);
      } catch (error) {
        console.error('Failed to fetch bird time trend data:', error);
      }
    };

    if (selectedBird) {
      fetchData();
    }
  }, [selectedBird]);

  const processTimeData = (jsonData) => {
    // Initialize the time intervals
    const timeIntervals = {
      'Morning': 0,
      'Afternoon': 0,
      'Evening': 0,
    };

    jsonData.forEach((item) => {
      const hour = parseInt(item.time.split(':')[0], 10); // Assuming time format is "HH:MM"
      if (hour >= 6 && hour < 12) { // Adjusted to include only morning hours
        timeIntervals['Morning'] += item.detections;
      } else if (hour >= 12 && hour < 18) {
        timeIntervals['Afternoon'] += item.detections;
      } else if (hour >= 18) { // Adjusted to correctly include evening hours
        timeIntervals['Evening'] += item.detections;
      }
    });

    // Convert to array suitable for chart
    return Object.keys(timeIntervals).map((interval) => ({
      time: interval,
      detections: timeIntervals[interval],
    }));
  };

  useEffect(() => {
    if (data.length > 0) {
      const maxTime = data.reduce((max, item) => max.detections > item.detections ? max : item, data[0]);
      // Call the callback with the maxTime
      onMaxTimeOfDay(maxTime.time);
    }
  }, [data]);

  const getColor = (time) => {
    switch(time) {
      case 'Morning':
        return '#add8e6'; // Light blue
      case 'Afternoon':
        return '#87ceeb'; // Sky blue
      case 'Evening':
        return '#4682b4'; // Steel blue
      default:
        return theme.palette.primary.main; // Default color from theme
    }
  };

  if (data.length === 0) {
    return <div>No data available for {selectedBird}.</div>;
  }

  return (
    <Card>
      <CardContent>
        <Title>Time of Day Trend for {selectedBird}</Title>
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
            <XAxis dataKey="time" label={{ value: 'Time of Day', position: 'insideBottom', offset: -10 }} />
            <YAxis label={{ value: 'Bird Detections', angle: -90, position: 'insideLeft', dy: 50 }} />
            <Tooltip />
            <Bar dataKey="detections">
              {
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.time)} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default BirdTimeTrendChart;

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import Title from './Title';

const data = [
  { time: '00:00', amount: 100 },
  { time: '03:00', amount: 75},
  { time: '06:00', amount: 73 },
  { time: '09:00', amount: 67 },
  { time: '12:00', amount: 50 },
  { time: '15:00', amount: 30 },
  { time: '18:00', amount: 20 },
  { time: '21:00', amount: 10 },
  { time: '24:00', amount: 0 },
];

export default function FoodChart() {
  return (
    <React.Fragment>
      <Title>Today</Title>
      <div style={{ width: '100%', flexGrow: 1, overflow: 'hidden' }}>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{ top: 16, right: 20, left: 30, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'Percentage of food remaining', angle: -90, position: 'insideLeft', dy: 100 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </div>
    </React.Fragment>
  );
}

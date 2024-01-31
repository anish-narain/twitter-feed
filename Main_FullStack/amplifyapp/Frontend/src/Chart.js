import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, BarChart, XAxis, YAxis, Tooltip, axisClasses } from '@mui/x-charts'; // Import the Bar component

import Title from './Title';

// Generate Sales Data
function createData(time, amount, birds = 0) {
  return { time, amount, birds };
}

const data = [
  createData('00:00', 0),
  createData('03:00', 1),
  createData('06:00', 5),
  createData('09:00', 2), // Bird spotted at 9:00 with 3 birds
  createData('12:00', 8),
  createData('15:00', 5), // Bird spotted at 15:00 with 1 bird
  createData('18:00', 2),
  createData('21:00', 0),
  createData('24:00', 0),
];

export default function Chart() {
  const theme = useTheme();

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
              label: 'Birds detections',
              labelStyle: {
                ...theme.typography.body1,
                fill: theme.palette.text.primary,
              },
              tickLabelStyle: theme.typography.body2,
              max: 13,
              min: -1,
              tickNumber: 3,
            },
          ]}
          series={[
            {
              dataKey: 'amount',
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

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import Title from "./Title";

export default function FoodChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        const response = await fetch("http://localhost:5001/weight-today");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length === 0) {
          // Handle the case where there is no data for today
          setChartData([]);
        } else {
          setChartData(data);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeightData();
  }, []);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error loading chart: {error}</div>;
  }

  const generateTicks = () => {
    const ticks = [];
    for (let i = 0; i < 24; i += 3) {
      // Pad the hour with 0 if it is less than 10 for consistency
      const hour = i < 10 ? `0${i}` : i;
      ticks.push(`${hour}:00:00`); // Assuming your time is in 'HH:mm:ss' format
    }
    return ticks;
  };

  return (
    <React.Fragment>
      <Title>Today</Title>
      <div style={{ width: "100%", flexGrow: 1, overflow: "hidden" }}>
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{ top: 16, right: 20, left: 30, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => time.substring(0, 5)} // Extracts only 'HH:MM' from your time string
            label={{
              value: "Time of Day",
              position: 'insideBottomRight',
              offset: -15
            }}
          />
          <YAxis
            label={{
              value: "Food Weight",
              angle: -90,
              position: "insideLeft",
              dy: 50,
            }}
          />
          <Tooltip />
          <Legend
            wrapperStyle={{
              // Adjust these values to move the legend to your desired location
              top: -6,
              left: 75,
              transform: "translate(0, -40)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            name="Weight"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
        {chartData.length === 0 && <div>No data for the current date.</div>}
      </div>
    </React.Fragment>
  );
}

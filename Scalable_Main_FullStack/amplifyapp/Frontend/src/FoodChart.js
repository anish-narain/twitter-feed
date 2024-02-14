/*
Create a food weight chart of food weight against time for a given date
*/

import React, { useState, useEffect } from "react";
import { useUser } from './UserContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import Title from "./Title";

export default function FoodChart({ selectedDate }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number} = userDetails

  // Function to format the date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Determine the chart title based on selectedDate
  const chartTitle = selectedDate ? formatDate(selectedDate) : 'Today';

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/weight-on-date/${serial_number}/${selectedDate}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let data = await response.json();
        if (data.length === 0) {
          // Handle the case where there is no data for today
          setChartData([]);
        } else {
          // Filter out consecutive points with the same weight
          const filteredData = data.reduce((acc, current, index, array) => {
            // Always include the first data point
            if (index === 0) {
              acc.push(current);
            } else {
              // Include the data point if it's different from the last one included
              const lastIncluded = acc[acc.length - 1];
              if (current.amount !== lastIncluded.amount) {
                acc.push(current);
              }
            }
            return acc;
          }, []);
          setChartData(filteredData);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }    
    };

    fetchWeightData();
  }, [selectedDate]);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error loading chart: {error}</div>;
  }


  return (
    <React.Fragment>
      <Title>{chartTitle}</Title>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 16, right: 20, left: 30, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            scale="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(unixTime) => {
              // Format the tick to display however you prefer
              const date = new Date(unixTime);
              return `${date.getHours()}:${String(date.getMinutes()).padStart(
                2,
                "0"
              )}`;
            }}
            label={{
              value: "Time of Day",
              position: "insideBottomRight",
              offset: -15,
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
          <Tooltip
            formatter={(value, name) => {
              if (name === "Weight") {
                return [`${value}`, "Weight"]; // Ensure the weight is labelled correctly
              }
            }}
            labelFormatter={(label) => {
              const date = new Date(label);
              return [
                `Time : ${String(date.getHours()).padStart(2, "0")}:${String(
                  date.getMinutes()
                ).padStart(2, "0")}:${String(date.getSeconds()).padStart(
                  2,
                  "0"
                )}`,
              ];
            }}
          />
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
        </ResponsiveContainer>
        {chartData.length === 0 && <div>No data for the current date.</div>}
    </React.Fragment>
  );
}

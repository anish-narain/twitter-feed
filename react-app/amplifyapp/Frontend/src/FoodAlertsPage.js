/*
Food Alert Tab:
1. Show food weight chart across a selected date
2. Give the last weight data
3. Show Alert Message
*/

import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import FoodChart from "./FoodChart";
import WeightDateSelector from "./WeightDateSelector";
import Alert from "./Alert";
import Title from "./Title";
import { useUser } from './UserContext';

const defaultTheme = createTheme({
  typography: {
    fontFamily: "'Lilita One', cursive",
  },
});

function Dashboard({ signOut }) {
  // State to store the latest weight data
  const [latestWeight, setLatestWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number } = userDetails

  useEffect(() => {
    const fetchLatestWeightData = async () => {
      try {
        const response = await fetch(`http://ec2-3-85-198-193.compute-1.amazonaws.com:5001/weight-today/${serial_number}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the data is sorted with the latest entry last, take the last entry
        const latestEntry = data[data.length - 1];
        if (latestEntry) {
          setLatestWeight(latestEntry.amount);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
      }
    };

    fetchLatestWeightData();
  }, [selectedDate]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Food Chart on the left */}
            <Grid item xs={12} md={8} lg={9}>
              <Card>
                <CardContent>
                  {/* Date selector*/}
                  <WeightDateSelector onSelectDate={setSelectedDate} />
                  <div style={{ height: "300px", marginTop: "20px" }}>
                    {" "}
                    <FoodChart
                      latestWeight={latestWeight}
                      selectedDate={selectedDate}
                    />
                  </div>
                </CardContent>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              container
              direction="column"
              spacing={2}
            >
              {/* Latest Weight*/}
              <Grid item>
                <Card>
                  <CardContent>
                    <Title>Latest Weight</Title>
                    <Typography variant="body1">
                      {latestWeight !== null
                        ? `${latestWeight.toFixed(2)} g`
                        : "Loading..."}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {/* Food Supply alert */}
              <Grid item>
                <Alert latestWeight={latestWeight} />
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Dashboard;

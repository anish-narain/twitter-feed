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

const defaultTheme = createTheme({
  typography: {
    fontFamily: "'Lilita One', cursive",
  },
  // ... other theme settings
});

function Dashboard({ signOut }) {
  // State to store the latest weight data
  const [latestWeight, setLatestWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    // Fetch the latest weight data from the server
    const fetchLatestWeightData = async () => {
      try {
        const response = await fetch("http://localhost:5001/weight-today");
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

    // Depending on how often we want to fetch the latest data below is an interval to fetch every minute
    // const interval = setInterval(fetchLatestWeightData, 60000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/*<Typography variant="h4" gutterBottom>
            Food Alerts
  </Typography>*/}
          <Grid container spacing={3}>
            {/* Food Chart on the left */}
            <Grid item xs={12} md={8} lg={9}>
              <Card>
                <CardContent>
                  {/* Place the date selector here */}
                  <WeightDateSelector onSelectDate={setSelectedDate} />
                  <div style={{ height: "300px", marginTop: "20px" }}>
                    {" "}
                    {/* Adjust height as needed */}
                    <FoodChart
                      latestWeight={latestWeight}
                      selectedDate={selectedDate}
                    />
                  </div>
                </CardContent>
              </Card>
            </Grid>
            {/* Alerts on the right */}
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              container
              direction="column"
              spacing={2}
            >
              {/* Latest Weight alert */}
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

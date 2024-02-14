/*
Construct Food Alert Text
*/

import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Title from "./Title";

function Alert({ latestWeight }) {
  const weightThreshold = 30; // Set the weight threshold for the alert
  const isLowFood = latestWeight < weightThreshold;

  return (
    <Paper elevation={3} style={{ padding: "16px", maxWidth: "300px" }}>
      {isLowFood ? (
        <>
          <Title>Food is running low!</Title>
          <Typography variant="body1">
            Please fill up your Twitter Feeder to maximise your chances of seeing more birds :)
          </Typography>
        </>
      ) : (
        <>
          <Title>Food supply is sufficient. </Title>
          <Typography variant="body1">
            You have enough food for your birds.
          </Typography>
        </>
      )}
    </Paper>
  );
}

export default Alert;

import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Title from "./Title";

function TrendAlert({ maxTime, maxTempRange }) {
  return (
    <Paper elevation={3} style={{ padding: "16px", maxWidth: "300px", marginBottom: "16px" }}>
      <Title>{`Most Active Time: ${maxTime}`}</Title>
      <Typography variant="body1">
        {`The birds are most commonly detected during the ${maxTime} time.`}
      </Typography>
      <Title>{`Preferred Temperature Range: ${maxTempRange}`}</Title>
      <Typography variant="body1">
        {`The birds are most commonly detected within the temperature range of ${maxTempRange} degrees Celsius.`}
      </Typography>
    </Paper>
  );
}

export default TrendAlert;

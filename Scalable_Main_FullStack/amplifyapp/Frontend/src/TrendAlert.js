/*
Temperature Trend Text
*/

import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Title from "./Title";

function TrendAlert({ maxTime, maxTempRange }) {
  return (
    <Paper elevation={3} style={{ padding: "16px", maxWidth: "300px", marginBottom: "16px" }}>
      <div style={{ marginBottom: "8px" }}>
        <Title>{`Most Active Time: `}<span style={{ backgroundColor: "#00FFFF" }}>{maxTime}</span></Title>
      </div>
      <Typography variant="body1">
        {`The birds are most commonly detected during the ${maxTime} time.`}
      </Typography>
      <div style={{ marginTop: "16px", marginBottom: "8px" }}>
        <Title>{`Preferred Temperature Range: `}<span style={{ backgroundColor: "#00FFFF" }}>{maxTempRange}</span></Title>
      </div>
      <Typography variant="body1">
        {`The birds are most commonly detected within the temperature range of ${maxTempRange} degrees Celsius.`}
      </Typography>
    </Paper>
  );
}


export default TrendAlert;

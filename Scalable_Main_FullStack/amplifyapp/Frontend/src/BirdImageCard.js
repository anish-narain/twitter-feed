import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Title from "./Title"; // Assuming Title is a component you've defined similar to in TrendAlert.js

const BirdImageCard = ({ birdImage, birdLabel }) => {
  return (
    <Paper elevation={3} style={{ padding: "16px", maxWidth: "300px", marginBottom: "16px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Title>{birdLabel}</Title>
      {birdImage ? (
        <img src={birdImage} alt={`Image of ${birdLabel}`} style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '16px' }} />
      ) : (
        <Typography variant="body1" style={{ textAlign: 'center' }}>
          No image available
        </Typography>
      )}
    </Paper>
  );
};

export default BirdImageCard;

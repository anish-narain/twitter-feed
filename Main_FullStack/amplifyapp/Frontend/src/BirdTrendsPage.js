import React, { useState } from 'react';
import BirdSelector from './BirdSelector'; // Adjust the import path as needed
import BirdTimeTrendChart from './BirdTimeTrendChart';
import BirdTemperatureTrendChart from './BirdTemperatureTrendChart';
import TrendAlert from './TrendAlert'; // Import the new TrendAlert component

function Dashboard() {
  const [selectedBird, setSelectedBird] = useState('');
  const [maxTimeOfDay, setMaxTimeOfDay] = useState(null);
  const [maxTemperatureRange, setMaxTemperatureRange] = useState(null);

  const handleSelectedBirdChange = (bird) => {
    setSelectedBird(bird);
    // Reset max values when a new bird is selected
    setMaxTimeOfDay(null);
    setMaxTemperatureRange(null);
  };

  // Callback functions to update max values from child components
  const handleMaxTimeOfDay = (time) => {
    setMaxTimeOfDay(time);
  };

  const handleMaxTemperatureRange = (range) => {
    setMaxTemperatureRange(range);
  };

  return (
    <div>
      <BirdSelector onSelectBird={handleSelectedBirdChange} />
      {selectedBird && (
        <>
          <TrendAlert maxTime={maxTimeOfDay} maxTempRange={maxTemperatureRange} />
          <BirdTimeTrendChart selectedBird={selectedBird} onMaxTimeOfDay={handleMaxTimeOfDay} />
          <BirdTemperatureTrendChart selectedBird={selectedBird} onMaxTemperatureRange={handleMaxTemperatureRange} />
        </>
      )}
    </div>
  );
}

export default Dashboard;

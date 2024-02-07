// Dashboard.js
import React, { useState } from 'react';
import BirdSelector from './BirdSelector'; // Adjust the import path as needed
import BirdTimeTrendChart from './BirdTimeTrendChart'; 
import BirdTemperatureTrendChart from './BirdTemperatureTrendChart'; // This will be your modified chart component

function Dashboard() {
  const [selectedBird, setSelectedBird] = useState('');

  const handleSelectedBirdChange = (bird) => {
    setSelectedBird(bird);
  };

  return (
    <div>
      <BirdSelector onSelectBird={handleSelectedBirdChange} />
      {selectedBird && <BirdTimeTrendChart selectedBird={selectedBird} />}
      {selectedBird && <BirdTemperatureTrendChart selectedBird={selectedBird} />}
    </div>
  );
}

export default Dashboard;
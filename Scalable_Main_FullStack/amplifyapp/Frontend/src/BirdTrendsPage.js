import React, { useState, useEffect } from 'react';
import BirdSelector from './BirdSelector'; // Adjust the import path as needed
import BirdTimeTrendChart from './BirdTimeTrendChart';
import BirdTemperatureTrendChart from './BirdTemperatureTrendChart';
import TrendAlert from './TrendAlert'; // Import the new TrendAlert component
import BirdImageCard from './BirdImageCard';
import { useUser } from './UserContext';

function Dashboard() {
  const [selectedBird, setSelectedBird] = useState('');
  const [maxTimeOfDay, setMaxTimeOfDay] = useState(null);
  const [maxTemperatureRange, setMaxTemperatureRange] = useState(null);
  const [birdImage, setBirdImage] = useState('');

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

  const { userDetails, setUserDetails } = useUser();
  const { userId, serial_number} = userDetails

  useEffect(() => {
    const fetchBirdImage = async () => {
      try {
        const response = await fetch(`http://localhost:5001/bird_image_trend/${serial_number}/${selectedBird}`);
        const data = await response.json();
        setBirdImage(data?.ImageUrl); // Set the image URL if the data is not null
      } catch (error) {
        console.error('Error fetching bird image:', error);
        setBirdImage(''); // Reset the image URL on error
      }
    };
  
    if (selectedBird) {
      fetchBirdImage();
    }
  }, [selectedBird]);

  return (
    <div>
      <BirdSelector onSelectBird={handleSelectedBirdChange} />
      {selectedBird && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', margin: '10px 0' }}>
            <div style={{ flex: 1, marginRight: '-20px' }}> {/* Adjust right margin to reduce the gap */}
              <TrendAlert maxTime={maxTimeOfDay} maxTempRange={maxTemperatureRange} />
            </div>
            <div style={{ flex: 1, marginLeft: '-150px' }}> {/* Adjust left margin to reduce the gap */}
              <BirdImageCard birdImage={birdImage} birdLabel={selectedBird} />
            </div>
          </div>
          <div style={{ margin: '10px 0' }}>
            <BirdTimeTrendChart selectedBird={selectedBird} onMaxTimeOfDay={handleMaxTimeOfDay} />
          </div>
          <BirdTemperatureTrendChart selectedBird={selectedBird} onMaxTemperatureRange={handleMaxTemperatureRange} />
        </>
      )}
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator, View, Card } from "@aws-amplify/ui-react";
import { useSelectedDate } from './SelectedDateContext'; // Import the context hook
import DateSelector from './DateSelector'; // Ensure the path is correct
import './App.css'; // Ensure you have this CSS file

function App() {
  const [images, setImages] = useState([]);
  const { selectedDate, setSelectedDate } = useSelectedDate(); // Use context for date

  const QueryDate = selectedDate 
    ? new Date(selectedDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isEffectActive = true;
  
    const fetchImages = async () => {
      // Immediately clear the images for the new date selection
      setImages(prevImages => {
        if (prevImages.length > 0) {
          return [];
        }
        return prevImages;
      });
  
      try {
        const response = await fetch(`http://localhost:5001/images/${QueryDate}`);
        const data = await response.json();
        if (isEffectActive) {
          // Filter and set images only if the response is not null
          setImages(data.filter(image => image.ImageUrl !== null));
        }
      } catch (error) {
        console.error(error);
        if (isEffectActive) {
          setImages([]);
        }
      }
    };
  
    if (QueryDate) {
      fetchImages();
    }
  
    // Cleanup function to set the effect as inactive
    return () => {
      isEffectActive = false;
    };
  }, [selectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <View className="App">
      <div className="header">
        <Card>
          {/* Card content here */}
        </Card>
        <DateSelector onSelectDate={handleSelectDate} />
      </div>
      <div className="image-list">
        {images.map((image, index) => (
          image.ImageUrl && (
            <div key={selectedDate + index} className="image-item">
              <img src={image.ImageUrl} alt={image.ImageFileName} className="image" />
              <p className="image-info">Uploaded on: {image.UploadTimestamp}</p>
            </div>
          )
        ))}
      </div>
    </View>
  );
}

export default withAuthenticator(App);
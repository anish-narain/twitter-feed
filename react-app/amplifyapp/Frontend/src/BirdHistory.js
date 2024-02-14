/*
Use to fetch all bird images taken at a specific date
and show all images in Dashboard Tab
*/


import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator, View, Card } from "@aws-amplify/ui-react";
import { useSelectedDate } from './SelectedDateContext'; 
import DateSelector from './DateSelector'; 
import './App.css'; 
import Title from "./Title";
import { useUser } from './UserContext';

function App() {
  const [images, setImages] = useState([]);
  const { selectedDate, setSelectedDate } = useSelectedDate(); // Use context for date
  const { userDetails, setUserDetails } = useUser();

  const QueryDate = selectedDate 
    ? new Date(selectedDate).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];

  const { userId, serial_number} = userDetails

  useEffect(() => {
    let isEffectActive = true;
  
    const fetchImages = async () => {
      setImages(prevImages => {
        if (prevImages.length > 0) {
          return [];
        }
        return prevImages;
      });
  
      try {
        const response = await fetch(`http://localhost:5001/images/${serial_number}/${QueryDate}`);
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
              <Title>We predict this bird to be {image.BirdLabel}. We are {parseFloat(image.Accuracy).toFixed(2)}% sure.</Title>
              <img src={image.ImageUrl} alt={image.ImageFileName} className="image" />
              <p className="image-info">Uploaded at {image.UploadTimestamp}</p>
            </div>
          )
        ))}
      </div>
    </View>
  );
}

export default withAuthenticator(App);
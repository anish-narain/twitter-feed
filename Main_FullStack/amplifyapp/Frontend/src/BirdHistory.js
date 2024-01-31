import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator, View, Card } from "@aws-amplify/ui-react";
import DateSelector from './DateSelector'; // Ensure the path is correct
import './App.css'; // Ensure you have this CSS file

function App() {
  const [images, setImages] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      fetch(`http://localhost:5001/images/${selectedDate}`)
        .then(response => response.json())
        .then(setImages)
        .catch(console.error);
    }
  }, [selectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <View className="App">
      <div className="header">
        <Card>
          {/* Sign out button removed */}
        </Card>
        <DateSelector onSelectDate={handleSelectDate} />
      </div>
      <div className="image-list">
        {images.map(image => (
          image.imageUrl && (
          <div key={image.ImageFileName} className="image-item">
            <img src={image.imageUrl} alt={image.ImageFileName} className="image" />
            <p className="image-info">Uploaded on: {image.UploadTimestamp}</p>
          </div>
          )
        ))}
      </div>
    </View>
  );
}

export default withAuthenticator(App);

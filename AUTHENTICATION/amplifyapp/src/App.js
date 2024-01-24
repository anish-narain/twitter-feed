import React, { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import {
  withAuthenticator,
  Button,
  Image,
  View,
  Card,
} from "@aws-amplify/ui-react";
import DateSelector from './DateSelector'; // Ensure the path is correct



function App({ signOut }) {
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
      <Card>
        <Button onClick={signOut}>Sign Out</Button>
      </Card>
      <DateSelector onSelectDate={handleSelectDate} />
      <div>
        {images.map(image => (
          <div key={image.FileName}>
            <img src={image.imageUrl} alt={image.FileName} />
            <p>Uploaded on: {image.UploadTimestamp}</p>
          </div>
        ))}
      </div>
    </View>
  );
}

export default withAuthenticator(App);
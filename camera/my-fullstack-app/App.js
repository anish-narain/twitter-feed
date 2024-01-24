import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';

function App() {
  const [images, setImages] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  
  useEffect(() => {
    if (selectedDate) {
      fetch(`http://localhost:5000/images/${selectedDate}`)
        .then(response => response.json())
        .then(setImages)
        .catch(console.error);
    }
  }, [selectedDate]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="App">
      <DateSelector onSelectDate={handleSelectDate} />
      <div>
        {images.map(image => (
          <div key={image.FileName}>
            <img src={image.imageUrl} alt={image.FileName} />
            <p>Uploaded on: {image.UploadTimestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

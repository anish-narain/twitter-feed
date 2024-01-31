import React, { useState } from 'react';

function App() {
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5001/weights/${date}`);
      const result = await response.json();

      if (Array.isArray(result) && result.length > 0) {
        // Log the retrieved data to the console
        console.log('Retrieved Data:', result);

        // Set the array of entries in the state
        setData(result);

        // Clear any previous errors
        setError(null);
      } else {
        // Set an error message in the state if the data is not as expected
        setError('No data found for the selected date.');

        // Clear the data state
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);

      // Set an error message in the state
      setError('Error fetching data. Please try again.');

      // Clear the data state
      setData([]);
    }
  };

  return (
    <div>
      <h1>Weight Viewer</h1>
      <div>
        <label>Select Date: </label>
        <input type="date" value={date} onChange={handleDateChange} />
        <button onClick={fetchData}>Fetch Data</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data.length > 0 && (
        <div>
          <h2>Retrieved Data:</h2>
          <table>
            <thead>
              <tr>
                <th>Upload Timestamp</th>
                <th>Image</th>
                <th>Bird Label</th>
                <th>Accuracy</th>
                <th>Bird Detect</th>
                <th>Food Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.UploadTimestamp}</td>
                  <td>
                    {entry.ImageUrl && <img src={entry.ImageUrl} alt={`Bird Image ${index}`} />}
                  </td>
                  <td>{entry.BirdLabel}</td>
                  <td>{entry.Accuracy}</td>
                  <td>{entry.BirdDetect}</td>
                  <td>{entry.FoodWeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

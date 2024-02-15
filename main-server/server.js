const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const app = express();
const port = 5001;

AWS.config.update({
  accessKeyId: "AKIATO4ZT6IXMKE6KWXZ",
  secretAccessKey: "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",
  region: "us-east-1",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "Twitter_Table_New";
const usertable = "Twitter_User_Table"
const bucketUrl = "https://twitterbirdbucket.s3.amazonaws.com";

app.use(cors());
app.use(express.json()); 

// Update user details (e.g., serial number) in the database
app.post('/user-details', async (req, res) => {
  const { userId, serial_number} = req.body; 
  console.log(`Received user ID: ${userId}`); 
  console.log(`Serial Number is : ${serial_number}`);
  if (userId && serial_number) {
    const params = {
      TableName: usertable,
      Key: {
        userId: userId, 
      },
      UpdateExpression: "set serial_number = :n",
      ExpressionAttributeValues: {
        ":n": serial_number,
      },
      ReturnValues: "UPDATED_NEW"
    };

    try {
      const data = await dynamodb.update(params).promise();
      console.log(`Update succeeded: ${JSON.stringify(data)}`);
      res.status(200).send({ message: 'User details updated successfully' });
    } catch (error) {
      console.error(`Update failed: ${error.message}`);
      res.status(500).send({ message: 'Failed to update user details' });
    }
  } else {
    // If userId or nickname is null, do not update DynamoDB and send a 400 response
    res.status(400).send({ message: 'userId and nickname are required' });
  }
});

// Retrieve and send sorted images for a given serial number and date, including URL construction for images
app.get("/images/:serial_number/:date", async (req, res) => {
  const {serial_number, date} = req.params; 
  //serial_number = 'AA123456'
  console.log(serial_number)

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": date,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const sortedItems = data.Items
      .map((item) => ({
        ...item,
        ImageUrl: item.BirdDetect && item.ImageFileName ? `${bucketUrl}/${item.ImageFileName}` : null,
        //ImageUrl: item.ImageFileName ? `${bucketUrl}/${item.ImageFileName}` : null,
      }))
      .filter((item) => item.ImageUrl) 
      .sort((a, b) => {
        // Assuming UploadTimestamp is in the format 'HH:MM:SS'
        const timeA = a.UploadTimestamp.split(':').map(Number);
        const timeB = b.UploadTimestamp.split(':').map(Number);
        return timeA[0] * 3600 + timeA[1] * 60 + timeA[2] - (timeB[0] * 3600 + timeB[1] * 60 + timeB[2]);
      });

    res.json(sortedItems);
    console.log(`IMAGES SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

// Retrieve and send the image with the highest accuracy for a given bird label and serial number
app.get('/bird_image_trend/:serial_number/:birdLabel', async (req, res) => {
  const { serial_number, birdLabel } = req.params; 

  const params = {
    TableName: tableName,
    FilterExpression: "BirdLabel = :birdLabel AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":birdLabel": birdLabel,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const imagesWithAccuracy = data.Items
      .filter(item => item.BirdDetect === 1 && item.ImageFileName && item.Accuracy)
      .map(item => ({
        ...item,
        ImageUrl: `${bucketUrl}/${item.ImageFileName}`
      }));

    imagesWithAccuracy.sort((a, b) => b.Accuracy - a.Accuracy);

    const highestAccuracyImage = imagesWithAccuracy[0] || null; 

    res.json(highestAccuracyImage);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

//-----------------------------------------------------------------------------------------
// Send trend data of bird detections against temperature for a given bird type and serial number
app.get('/bird_temperature_trend/:serial_number/:birdType', async (req, res) => {
  const { serial_number, birdType } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "BirdLabel = :birdType AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":birdType": birdType,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();

    const temperatureTrendData = {};

    data.Items.forEach((item) => {
      const temp = item.Temperature?.toString(); 

      if (!temp) {
        return;
      }

      if (!temperatureTrendData[temp]) {
        temperatureTrendData[temp] = {
          temperature: temp,
          detections: 0
        };
      }
      
      if (item.BirdDetect === 1) {
        temperatureTrendData[temp].detections += 1;
      }
    });

    const responseData = Object.values(temperatureTrendData);

    console.log(`Bird temperature trend data sent for bird type: ${birdType}`);
    res.json(responseData);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

// Send trend data of bird detections over time (hourly bins) for a given bird type and serial number
app.get('/bird_time_trend/:serial_number/:birdType', async (req, res) => {
  const { serial_number, birdType } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "BirdLabel = :birdType AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":birdType": birdType,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();

    const timeTrendData = {};
    data.Items.forEach((item) => {
      if (item.BirdDetect === 1) {
        const timestamp = new Date(item.UploadDateTimeUnique);
        const hour = timestamp.getHours();
        const timeBin = `${String(hour).padStart(2, '0')}:00`; 

        if (!timeTrendData[timeBin]) {
          timeTrendData[timeBin] = { time: timeBin, detections: 0 };
        }
        timeTrendData[timeBin].detections += 1;
      }
    });

    const responseData = Object.values(timeTrendData).sort((a, b) => a.time.localeCompare(b.time));
    console.log(`Bird time trend data sent for bird type: ${birdType}`);
    res.json(responseData);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

// Count and send the number of bird detections for a single date and serial number
app.get('/bird_detect_single_date/:serial_number/:date', async (req, res) => {
  const { serial_number, date } = req.params; 

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": date,
      ":serial_number": serial_number,
    }
  };

  try {
    const data = await dynamodb.scan(params).promise();

    // Sum up all the BirdDetect values
    const birdDetectionsCount = data.Items.reduce((count, item) => {
      return count + (item.BirdDetect === 1 ? 1 : 0);
    }, 0);

    res.json({ date: date, birdDetectionsCount: birdDetectionsCount });
    console.log(`NUMBER OF BIRD DETECTIONS FOR DATE: ${date} - ${birdDetectionsCount}`);
  } catch (error) {
    console.error('DynamoDB error:', error);
    res.status(500).send(error.toString());
  }
});

// Retrieve and send bird detections count segmented into 3-hour blocks for a given date and serial number
app.get('/bird_detections_chart/:serial_number/:date', async (req, res) => {
  const { serial_number, date } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": date,
      ":serial_number": serial_number,
    }
  };

  try {
    const data = await dynamodb.scan(params).promise();

    // Initialize an object to hold counts for each 3-hour block
    const birdDetectionsByBlock = {
      '00:00': 0,
      '03:00': 0,
      '06:00': 0,
      '09:00': 0,
      '12:00': 0,
      '15:00': 0,
      '18:00': 0,
      '21:00': 0
    };

    // Process each item
    data.Items.forEach(item => {
      if (item.BirdDetect === 1) {
        const fullDateTimeString = `${item.UploadDate}T${item.UploadTimestamp}`;
        const dateObject = new Date(fullDateTimeString);
        const hour = dateObject.getHours();
        const block = `${String(Math.floor(hour / 3) * 3).padStart(2, '0')}:00`;
        birdDetectionsByBlock[block]++;
      }
    });


    res.json({ date: date, birdDetectionsByBlock: birdDetectionsByBlock });
    console.log(`NUMBER OF BIRD DETECTIONS FOR DATE: ${date} - `, birdDetectionsByBlock);
  } catch (error) {
    console.error('DynamoDB error:', error);
    res.status(500).send(error.toString());
  }
});



const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

//------------------------------------------------------------------------------
// Retrieve and send the weight data for the current date for a given serial number
app.get("/weight-today/:serial_number", async (req, res) => {
  const { serial_number } = req.params;
  const today = getCurrentDate(); // Assuming this returns 'YYYY-MM-DD'

  const params = {
    TableName: tableName,
    FilterExpression: "serial_number = :serial_number AND attribute_exists(FoodWeight)",
    ExpressionAttributeValues: {
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    let closestDate = null;
    let smallestDiff = Number.MAX_SAFE_INTEGER;

    // First, find the closest date
    data.Items.forEach(item => {
      if (item.UploadDate && item.FoodWeight) {
        const itemDate = new Date(item.UploadDate);
        const todayDate = new Date(today);
        const diff = Math.abs(todayDate - itemDate);

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestDate = item.UploadDate;
        }
      }
    });

    if (closestDate) {
      // Filter items by the closest date and sort them by time
      const closestDateItems = data.Items.filter(item => item.UploadDate === closestDate)
        .sort((a, b) => {
          const timeA = a.UploadDateTimeUnique ? new Date(a.UploadDateTimeUnique).getTime() : 0;
          const timeB = b.UploadDateTimeUnique ? new Date(b.UploadDateTimeUnique).getTime() : 0;
          return timeA - timeB;
        });

      // Map to the desired format
      const sortedWeightData = closestDateItems.map(item => ({
        time: item.UploadDateTimeUnique ? new Date(item.UploadDateTimeUnique).toISOString() : 'Unknown time',
        amount: item.FoodWeight,
        date: item.UploadDate
      }));

      res.json(sortedWeightData);
      console.log(`WEIGHT DATA SENT FOR CLOSEST DATE: ${closestDate}`);
    } else {
      res.status(404).send("No weight data found near the specified date.");
    }
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});


//------------------------------------------------------------------------------------------------------------
// Retrieve and send the weight data for a specified date and serial number
app.get("/weight-on-date/:serial_number/:date", async (req, res) => {
  const { serial_number, date } = req.params;
  
  const params = {
    TableName: tableName,
    FilterExpression: "contains(UploadDateTimeUnique, :date) AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": date,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const weightData = data.Items
      .map((item) => ({
        time: new Date(item.UploadDateTimeUnique).getTime(),
        amount: item.FoodWeight,
      }))
      .filter((item) => item.amount) 
      .sort((a, b) => a.time - b.time);

    // Send the sorted data
    res.json(weightData);
    console.log(`WEIGHT DATA SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});


//------------------------------------------------------------------------
// Retrieve and send a list of unique bird labels detected for a given serial number
app.get('/unique-bird-labels/:serial_number', async (req, res) => {
  const { serial_number } = req.params;
  const params = {
    TableName: tableName,
    ProjectionExpression: "BirdLabel",
    FilterExpression: "serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":serial_number": serial_number,
    },
  };
  try {
    const data = await dynamodb.scan(params).promise();
    const labels = [...new Set(data.Items.map(item => item.BirdLabel))].sort();
    console.log(`Unique Bird Labels Sent`);
    res.json(labels);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});


// Retrieve and send all data
app.get('/data/:serial_number/:date', async (req, res) => {
  const { serial_number, date } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": date,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const weightsData = data.Items.map((item) => ({
      UploadDateTimeUnique: item.UploadDateTimeUnique,
      Accuracy: item.Accuracy,
      BirdDetect: item.BirdDetect,
      BirdLabel: item.BirdLabel,
      FoodWeight: item.FoodWeight,
      ImageFileName: item.ImageFileName,
      ImageUrl:
        item.BirdDetect && item.ImageFileName
          ? `${bucketUrl}/${item.ImageFileName}`
          : null,
      UploadDate: item.UploadDate,
      UploadTimestamp: item.UploadTimestamp,
    }));

    // Send the retrieved data as JSON
    res.json(weightsData);
    console.log(`SENSOR JSON DATA SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// Starts the server and listens on a specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


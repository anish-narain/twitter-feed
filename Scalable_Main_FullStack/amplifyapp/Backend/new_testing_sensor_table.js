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

app.post('/user-details', async (req, res) => {
  const { userId, serial_number} = req.body; // Extracting userId sent from the client
  console.log(`Received user ID: ${userId}`); // Logging the user ID
  console.log(`Serial Number is : ${serial_number}`);
  // Check if userId and nickname are not null
  if (userId && serial_number) {
    const params = {
      TableName: usertable,
      Key: {
        userId: userId, // Assuming 'userId' is the name of your primary key attribute
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

app.get("/images/:serial_number/:date", async (req, res) => {
  const {serial_number, date} = req.params; // Get the date from the URL parameter'
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
      .filter((item) => item.ImageUrl) // Filter out items without an ImageUrl
      .sort((a, b) => {
        // Assuming UploadTimestamp is in the format 'HH:MM:SS'
        const timeA = a.UploadTimestamp.split(':').map(Number);
        const timeB = b.UploadTimestamp.split(':').map(Number);
        // Convert hours and minutes to seconds and add them up to compare
        return timeA[0] * 3600 + timeA[1] * 60 + timeA[2] - (timeB[0] * 3600 + timeB[1] * 60 + timeB[2]);
      });

    res.json(sortedItems);
    console.log(`IMAGES SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

app.get('/bird_image_trend/:serial_number/:birdLabel', async (req, res) => {
  const { serial_number, birdLabel } = req.params; // Get the bird label from the URL parameter

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
    // Filter out items without an ImageFileName or a BirdDetect value of 0
    const imagesWithAccuracy = data.Items
      .filter(item => item.BirdDetect === 1 && item.ImageFileName && item.Accuracy)
      .map(item => ({
        ...item,
        ImageUrl: `${bucketUrl}/${item.ImageFileName}`
      }));

    // Sort by accuracy in descending order to get the image with the highest accuracy first
    imagesWithAccuracy.sort((a, b) => b.Accuracy - a.Accuracy);

    const highestAccuracyImage = imagesWithAccuracy[0] || null; // If there's no image, return null

    res.json(highestAccuracyImage);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

//-----------------------------------------------------------------------------------------

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
      // Check if Temperature is defined before accessing its value
      const temp = item.Temperature?.toString(); // Use optional chaining operator

      if (!temp) {
        // Skip this item if Temperature is undefined
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
    // Example time binning logic (adjust based on desired intervals)
    data.Items.forEach((item) => {
      if (item.BirdDetect === 1) {
        const timestamp = new Date(item.UploadDateTimeUnique);
        const hour = timestamp.getHours();
        const timeBin = `${String(hour).padStart(2, '0')}:00`; // Hourly bins

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


app.get('/bird_detect_single_date/:serial_number/:date', async (req, res) => {
  const { serial_number, date } = req.params; // Get the date from the URL parameter

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

app.get('/bird_detections_chart/:serial_number/:date', async (req, res) => {
  const { serial_number, date } = req.params; // Get the date from the URL parameter

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
        // Combine UploadDate and UploadTimestamp to create a full date-time string
        const fullDateTimeString = `${item.UploadDate}T${item.UploadTimestamp}`;
        // Create a Date object from the full date-time string
        const dateObject = new Date(fullDateTimeString);
        // Extract the hour from the Date object
        const hour = dateObject.getHours();
        // Determine the 3-hour block
        const block = `${String(Math.floor(hour / 3) * 3).padStart(2, '0')}:00`;
        // Increment the count for the corresponding block
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
  return now.toISOString().split("T")[0]; // returns date in YYYY-MM-DD format
};


//------------------------------------------------------------------------------
app.get("/weight-today/:serial_number", async (req, res) => {
  //const today = "2022-02-03";  // Use a fixed date for demonstration
  const { serial_number} = req.params;
  const today = getCurrentDate();  

  const params = {
    TableName: tableName,
    FilterExpression: "contains(UploadDateTimeUnique, :date) AND serial_number = :serial_number",
    ExpressionAttributeValues: {
      ":date": today,
      ":serial_number": serial_number,
    },
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const weightData = data.Items
      .map((item) => ({
        // Send the time as a timestamp (number of milliseconds since the Unix epoch)
        time: new Date(item.UploadDateTimeUnique).getTime(),
        amount: item.FoodWeight,
      }))
      .filter((item) => item.amount) // Filter out any items without weight
      .sort((a, b) => a.time - b.time); // Sort the data based on the timestamp

    // Send the sorted data
    res.json(weightData);
    console.log(`WEIGHT DATA SENT FOR TODAY: ${today}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

//------------------------------------------------------------------------------------------------------------

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
        // Send the time as a timestamp (number of milliseconds since the Unix epoch)
        time: new Date(item.UploadDateTimeUnique).getTime(),
        amount: item.FoodWeight,
      }))
      .filter((item) => item.amount) // Filter out any items without weight
      .sort((a, b) => a.time - b.time); // Sort the data based on the timestamp

    // Send the sorted data
    res.json(weightData);
    console.log(`WEIGHT DATA SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});


//------------------------------------------------------------------------
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
    // Extract unique labels and sort them
    const labels = [...new Set(data.Items.map(item => item.BirdLabel))].sort();
    console.log(`Unique Bird Labels Sent`);
    res.json(labels);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});



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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


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
const bucketUrl = "https://twitterbirdbucket.s3.amazonaws.com";

app.use(cors());

app.get("/images/:date", async (req, res) => {
  const { date } = req.params; // Get the date from the URL parameter

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date",
    ExpressionAttributeValues: {
      ":date": date,
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
    console.log(`IMAGE SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});


app.get('/bird_detect_single_date/:date', async (req, res) => {
  const { date } = req.params; // Get the date from the URL parameter

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date",
    ExpressionAttributeValues: {
      ":date": date,
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

app.get('/bird_detect_haha/:date', async (req, res) => {
  const { date } = req.params; // Get the date from the URL parameter

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date",
    ExpressionAttributeValues: {
      ":date": date,
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

app.get("/weight-today", async (req, res) => {
  const today = "2022-02-03";  // Use a fixed date for demonstration

  const params = {
    TableName: tableName,
    FilterExpression: "contains(UploadDateTimeUnique, :date)",
    ExpressionAttributeValues: {
      ":date": today,
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


app.get('/data/:date', async (req, res) => {
  const { date } = req.params;

  const params = {
    TableName: tableName,
    FilterExpression: "UploadDate = :date",
    ExpressionAttributeValues: {
      ":date": date,
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

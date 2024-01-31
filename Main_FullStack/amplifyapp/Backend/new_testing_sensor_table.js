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
const bucketUrl = "https://idkw.s3.eu-west-2.amazonaws.com";

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
    const imagesWithUrls = data.Items.map((item) => ({
      ...item,
      ImageUrl:
        item.BirdDetect && item.ImageFileName
          ? `${bucketUrl}/${item.ImageFileName}`
          : null,
    }));
    res.json(imagesWithUrls);
    console.log(`IMAGE SENT FOR DATE: ${date}`);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).send(error.toString());
  }
});

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // returns date in YYYY-MM-DD format
};

app.get("/weight-today", async (req, res) => {
    const today = "2024-01-29";  // Use a fixed date for demonstration
  
    // Uncomment and implement the getCurrentDate function to use the current date
    // const today = getCurrentDate(); 
  
    const params = {
      TableName: tableName,
      FilterExpression: "contains(UploadDateTimeUnique, :date)",
      ExpressionAttributeValues: {
        ":date": today,
      },
    };
  
    try {
      const data = await dynamodb.scan(params).promise();
      const weightData = data.Items.map((item) => ({
        time: item.UploadTimestamp,
        amount: item.FoodWeight,
      })).filter((item) => item.amount) // Filter out any items without weight
      .sort((a, b) => {
        // Assuming UploadTimestamp is in the format 'HH:MM:SS'
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0]*3600 + timeA[1]*60 + timeA[2] - (timeB[0]*3600 + timeB[1]*60 + timeB[2]);
      });
  
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

app.get("/weight-today", async (req, res) => {
    const today = "2024-01-29";  // For demonstration, use a fixed date
    
    const params = {
      TableName: tableName,
      FilterExpression: "contains(UploadDateTimeUnique, :date)",
      ExpressionAttributeValues: {
        ":date": today,
      },
    };
  
    try {
      const data = await dynamodb.scan(params).promise();
      const weightData = data.Items.map((item) => ({
        time: item.UploadTimestamp,
        amount: item.FoodWeight,
      })).filter((item) => item.amount)
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0]*3600 + timeA[1]*60 + timeA[2] - (timeB[0]*3600 + timeB[1]*60 + timeB[2]);
      });
  
      // Send only the last (latest) weight data
      res.json(weightData[weightData.length - 1]); // Assuming the array is not empty
      console.log(`LATEST WEIGHT DATA SENT FOR TODAY: ${today}`);
    } catch (error) {
      console.error("DynamoDB error:", error);
      res.status(500).send(error.toString());
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

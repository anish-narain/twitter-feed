const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
const port = 5001;

AWS.config.update({
    accessKeyId: "AKIATO4ZT6IXMKE6KWXZ",
    secretAccessKey: "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",
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "Twitter_Table_New";
const bucketUrl = "https://idkw.s3.eu-west-2.amazonaws.com";

app.use(cors());

app.get('/images/:date', async (req, res) => {
    const { date } = req.params; // Get the date from the URL parameter
  
    const params = {
        TableName: tableName,
        FilterExpression: "UploadDate = :date",
        ExpressionAttributeValues: {
            ":date": date
        }
    };

    try {
        const data = await dynamodb.scan(params).promise();
        const imagesWithUrls = data.Items.map(item => ({
            ...item,
            imageUrl: item.BirdDetect && item.ImageFileName ? `${bucketUrl}/${item.ImageFileName}` : null
        }));
        res.json(imagesWithUrls);
        console.log(`IMAGE SENT FOR DATE: ${date}`);
    } catch (error) {
        console.error('DynamoDB error:', error);
        res.status(500).send(error.toString());
    }
  });

app.get('/data/:date', async (req, res) => {
    const { date } = req.params;

    const params = {
        TableName: tableName,
        FilterExpression: "UploadDate = :date",
        ExpressionAttributeValues: {
            ":date": date
        }
    };

    try {
        const data = await dynamodb.scan(params).promise();
        const weightsData = data.Items.map(item => ({
            UploadDateTimeUnique: item.UploadDateTimeUnique,
            Accuracy: item.Accuracy,
            BirdDetect: item.BirdDetect,
            BirdLabel: item.BirdLabel,
            FoodWeight: item.FoodWeight,
            ImageFileName: item.ImageFileName,
            ImageUrl: item.BirdDetect && item.ImageFileName ? `${bucketUrl}/${item.ImageFileName}` : null,
            UploadDate: item.UploadDate,
            UploadTimestamp: item.UploadTimestamp
        }));
        

        // Send the retrieved data as JSON
        res.json(weightsData);
        console.log(`SENSOR JSON DATA SENT FOR DATE: ${date}`);
    } catch (error) {
        console.error('DynamoDB error:', error);
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

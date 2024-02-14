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
const tableName = "Twitter_weight_table";
const bucketUrl = "https://twitterbirdbucket.s3.amazonaws.com";

app.use(cors());

app.get('/weights/:date', async (req, res) => {
    const { date } = req.params;

    const params = {
        TableName: tableName,
        KeyConditionExpression: "UploadDate = :date",
        ExpressionAttributeValues: {
            ":date": date
        }
    };

    try {
        const data = await dynamodb.query(params).promise();
        const weightsData = data.Items.map(item => ({
            UploadTimestamp: item.UploadTimestamp,
            BirdDetect: item.BirdDetect,
            FoodWeight: item.FoodWeight,
            ImageUrl: item.BirdDetect ? `${bucketUrl}/${item.ImageFileName}` : null
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

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
const port = 5001;

AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "Twitter_weight_table"; 

const bucketUrl = "https://idkw.s3.eu-west-2.amazonaws.com";

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
        res.json(weightsData);
    } catch (error) {
        console.error('DynamoDB error:', error);
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

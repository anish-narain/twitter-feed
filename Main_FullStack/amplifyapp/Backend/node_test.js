const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors'); // Import CORS module
const app = express();
const port = 5001;


// if running on ec2 instance, no need for Accesskey!!!
// Verified that ec2 instance has the ability to receive info from dynamodb with full access
// AWS configuration
AWS.config.update({
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "upload_image_name";
const bucketUrl = "https://idkw.s3.eu-west-2.amazonaws.com";

// Enable CORS for all routes
app.use(cors());

app.get('/images/:date', async (req, res) => {
    const { date } = req.params; // Get the date from the URL parameter
  
    const params = {
        TableName: tableName,
        KeyConditionExpression: "UploadDate = :date", // Query for a specific date
        ExpressionAttributeValues: {
            ":date": date
        }
    };
  
    try {
        const data = await dynamodb.query(params).promise();
        const imagesWithUrls = data.Items.map(item => ({
            ...item,
            imageUrl: `${bucketUrl}/${item.FileName}`
        }));
        res.json(imagesWithUrls);
    } catch (error) {
        console.error('DynamoDB error:', error);
        res.status(500).send(error.toString());
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
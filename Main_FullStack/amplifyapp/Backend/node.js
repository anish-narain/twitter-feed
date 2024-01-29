const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5001;

// AWS configuration
AWS.config.update({
    accessKeyId: "AKIATO4ZT6IXMKE6KWXZ",
    secretAccessKey: "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",
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "upload_image_name";
const bucketName = "idkw"; 
const bucketUrl = `https://${bucketName}.s3.amazonaws.com`;  // S3 bucket URL

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

app.post('/upload', async (req, res) => {
    try {
        const { fileName, uploadDate, uploadTimestamp, fileContent } = req.body;

        // Upload file to S3
        const s3Params = {
            Bucket: bucketName,
            Key: fileName,
            Body: Buffer.from(fileContent, 'base64'), // Assuming the content is base64 encoded
        };

        await s3.upload(s3Params).promise();

        // Add entry to DynamoDB
        const dynamoDBParams = {
            TableName: tableName,
            Item: {
                UploadDate: uploadDate,
                UploadTimestamp: uploadTimestamp,
                FileName: fileName,
            },
        };

        await dynamodb.put(dynamoDBParams).promise();

        res.status(200).send('File uploaded successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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

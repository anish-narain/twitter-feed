const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors'); // Import CORS module
const app = express();
const port = 3001;

// AWS configuration
AWS.config.update({
    accessKeyId: "AKIATO4ZT6IXMKE6KWXZ",
    secretAccessKey: "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",
    region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "upload_image_name";
const bucketUrl = "https://idkw.s3.eu-west-2.amazonaws.com";

// Enable CORS for all routes
app.use(cors());

app.get('/images', async (req, res) => {
  const params = {
      TableName: tableName,
  };

  try {
      const data = await dynamodb.scan(params).promise();
      const sortedImages = data.Items.sort((b, a) => new Date(b.UploadTimestamp) - new Date(a.UploadTimestamp));
      const imagesWithUrls = sortedImages.map(item => ({
          ...item,
          imageUrl: `${bucketUrl}/${item.FileName}`
      }));
      res.json(imagesWithUrls);
  } catch (error) {
      res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
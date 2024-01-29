from flask import Flask, request
import threading
import requests
from PIL import Image
from io import BytesIO
import boto3

# Import your model and prediction function
from bird_model_copy import predict_image, BirdResnet, ResNet34, get_default_device, to_device
import torch

app = Flask(__name__)

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Twitter_Table_New')

def handle_prediction(image_url, primary_key_value):
    # Function to handle prediction and storing results
    try:
        device=get_default_device()

        model = to_device(ResNet34(3,450), device)
        model=(BirdResnet(model))
        model.load_state_dict(torch.load('bird-resnet34best.pth',map_location=torch.device(device)))

        label, acc = predict_image(image_url, model)

        # Store results in DynamoDB
        # Update the DynamoDB item
        response = table.update_item(
            Key={
                'YourPrimaryKeyAttributeName': primary_key_value
            },
            UpdateExpression="set BirdDetect=:l, Accuracy=:a",
            ExpressionAttributeValues={
                ':l': label,
                ':a': acc
            },
            ReturnValues="UPDATED_NEW"
        )
    except Exception as e:
        print(f"Error processing image: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_url = data.get('image_url')
    primary_key_value = data.get('primary_key_value')  # This could be the 'UploadDate' or 'ImageFileName'

    if not image_url or not primary_key_value:
        return "Missing image URL or primary key value", 400

    # Start the prediction task in a new thread
    threading.Thread(target=handle_prediction, args=(image_url, primary_key_value)).start()
    
    return "Prediction task started", 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

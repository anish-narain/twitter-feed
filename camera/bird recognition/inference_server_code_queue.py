from flask import Flask, request
from queue import Queue
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
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # replace 'us-east-1' with your region
table = dynamodb.Table('Twitter_Table_New')  # replace with your DynamoDB table name

# Initialize a Queue
task_queue = Queue()

def handle_prediction(image_url, primary_key_value):
    try:
        print(f"Start processing image {image_url}")
        device = get_default_device()

        model = to_device(ResNet34(3,450), device)
        model = BirdResnet(model)
        model.load_state_dict(torch.load('bird-resnet34best.pth', map_location=torch.device(device)))

        label, acc = predict_image(image_url, model)

        # Store results in DynamoDB
        response = table.update_item(
            Key={
                'UploadDateTimeUnique': primary_key_value
            },
            UpdateExpression="set BirdLabel=:l, Accuracy=:a",
            ExpressionAttributeValues={
                ':l': label,
                ':a': acc
            },
            ReturnValues="UPDATED_NEW"        
        )
        print(f"Label for image {image_url} is successfully uploaded to Table")
    except Exception as e:
        print(f"Error processing image: {e}")

def worker():
    while True:
        # Get a task from the queue
        image_url, primary_key_value = task_queue.get()

        # Print the approximate number of remaining tasks
        print(f"Remaining tasks in queue: {task_queue.qsize()}")

        try:
            # Process the task
            handle_prediction(image_url, primary_key_value)
        finally:
            # Mark the task as done
            task_queue.task_done()


# Start the worker thread
threading.Thread(target=worker, daemon=True).start()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_url = data.get('image_url')
    primary_key_value = data.get('primary_key_value')

    if not image_url or not primary_key_value:
        return "Missing image URL or primary key value", 400

    # Add the task to the queue
    task_queue.put((image_url, primary_key_value))

    return "Prediction task queued", 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
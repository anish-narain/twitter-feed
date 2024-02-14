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

        model = to_device(ResNet34(3, 450), device)
        model = BirdResnet(model)
        model.load_state_dict(torch.load('bird-resnet34best.pth', map_location=torch.device(device)))

        label, acc = predict_image(image_url, model)

        # Determine if BirdDetect should be updated to 1
        # Threshold is here 95% -------------------------------------------------------------------------------
        bird_detect_update = 1 if acc > 95 else 0

        acc = str(acc)

        # Prepare update expressions
        update_expression = "set BirdLabel=:l, Accuracy=:a"
        expression_attribute_values = {
            ':l': label,
            ':a': acc
        }

        # If accuracy is above 95%, add BirdDetect to the update
        if bird_detect_update:
            update_expression += ", BirdDetect=:b"
            expression_attribute_values[':b'] = bird_detect_update

        # Store results in DynamoDB
        response = table.update_item(
            Key={
                'UploadDateTimeUnique': primary_key_value
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
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
        print(f"Starting processing a new request: Remaining tasks in queue: {task_queue.qsize()}")

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
    # Print the approximate number of remaining tasks
    print(f"Recieved a new prediction request: Remaining tasks in queue: {task_queue.qsize()}")

    return "Prediction task queued", 202

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

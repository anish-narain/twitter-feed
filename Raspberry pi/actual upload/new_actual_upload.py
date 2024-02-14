import datetime
import random
from decimal import Decimal
import threading
import time
import boto3
import os
import requests
from botocore.exceptions import ClientError

import smbus2
import weightSensor
import tempSensor

from queue import Queue
from urllib.parse import quote


"""
 # remember in raspberry pi root folder   .bashrc

 add the following two lines
 export AWS_ACCESS_KEY_ID=your_access_key_id_here
    export AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
 
"""


# AWS S3 setup
access_key = "AKIATO4ZT6IXMKE6KWXZ"  # Replace with your actual access key
access_secret = "sh4WMN8MbRKmGNE9O8/prTZqzT3W9mq/rxJ7S7bH"  # Replace with your actual secret key
bucket_name = "twitterbirdbucket"  # Replace with your actual bucket name
region_name = 'us-east-1'

# Bird Feeder Serial Number-----------------------------------------------
serial_number = 'AA123456'

client_s3 = boto3.client(
    's3',
    aws_access_key_id=access_key,
    aws_secret_access_key=access_secret
)

# AWS DynamoDB setup
# AWS DynamoDB setup
dynamodb = boto3.resource('dynamodb', 
    aws_access_key_id=access_key, 
    aws_secret_access_key=access_secret,
    region_name=region_name
)

table = dynamodb.Table('Twitter_Table_New')  # Replace with your actual DynamoDB table name
table1 = dynamodb.Table('Twitter_Table_New')  # Replace with your actual DynamoDB table name

# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "images")

if not os.path.exists(data_file_folder):
    os.makedirs(data_file_folder)
    

# Example usage
server_url = 'http://18.209.102.29:5000'  # Replace with your server's IP and port
image_url = 'https://twitterbirdbucket.s3.amazonaws.com'  # Replace with your image URL

# Initialize weight sensor
i2c_bus = smbus2.SMBus(1)

weight1 = weightSensor.ADC(0x48, i2c_bus) # ADC on address 0x48
weight1.setConfig("100", "001", "0", write=True) # Set voltage range to smallest, i.e. most sensitive. Set to continuous read mode, so need to write new config now.
weightSensor.calibrateSensors(weight1, mass=231, mass2=369)

def send_prediction_request(server_url, image_url, primary_key_value):
    data = {
        'image_url': image_url,
        'primary_key_value': primary_key_value
    }

    response = requests.post(server_url + '/predict', json=data)

    if response.status_code == 202:
        print("Prediction task started successfully.")
    else:
        print(f"Error: {response.text}")

def bird_detect_fn():
    last_update_time = time.time()  # Initialize last update time
    
    while True:
        # Detect bird and take photo
        (w, w_g, bird_detect, capture_time, image_file_name, file_path) = weightSensor.loop(weight1, 100)
        print(bird_detect)
        
        # Check if bird is detected and photo is taken
        if bird_detect and image_file_name != '':
            try:
                # Upload image to S3 bucket
                print(f"Uploading file {image_file_name} ....")
                client_s3.upload_file(file_path, bucket_name, image_file_name)
                
                # Add entry to DynamoDB
                # Initially always set BirdDetect to 0
                # Update bird detect in server code after prediction
                current_date = capture_time.strftime("%Y-%m-%d")
                current_timestamp = capture_time.strftime('%H:%M:%S')

                # Get weight and temperature
                weight_food = weightSensor.measure2_g(weight1) - w_g - 369
                temperature = tempSensor.readTemp(i2c_bus)

                time.sleep(0.1)

                table1.put_item(
                    Item={
                        'UploadDateTimeUnique': capture_time.isoformat(),
                        'BirdDetect': Decimal(1),
                        'Accuracy': None,
                        'BirdLabel': None,
                        'serial_number': serial_number,
                        'FoodWeight': round(Decimal(weight_food), 2),
                        'Temperature': round(Decimal(temperature), 2),
                        'ImageFileName': quote(image_file_name),
                        'UploadDate': current_date,
                        'UploadTimestamp': current_timestamp,
                    }
                )
                print(f"Weights, Temperature, and Imagepath are uploaded to DynamoDB {current_timestamp}, {round(weight_food, 2)}g, {round(temperature, 2)}C, {image_file_name}")
                
                # Send prediction request to server
                image_url_cur = image_url + "/" + quote(image_file_name)
                send_prediction_request(server_url, image_url_cur, capture_time.isoformat())

            except ClientError as e:
                print('Error occurred during AWS operation.')
                print(e)
            except Exception as e:
                print(e)

        # Check if 5 seconds have passed since the last update
        current_time = time.time()
        if current_time - last_update_time >= 5:
            try:
                # Get weight and temperature
                weight_food = weightSensor.measure2_g(weight1)
                temperature = tempSensor.readTemp(i2c_bus)
                time.sleep(0.1)

                # Update current data
                current_date_time_unique = datetime.datetime.now()
                current_date = current_date_time_unique.strftime("%Y-%m-%d")
                current_timestamp = current_date_time_unique.strftime('%H:%M:%S')

                # Add entry to DynamoDB
                # Initially always set BirdDetect to 0
                table.put_item(
                    Item={
                        'UploadDateTimeUnique': current_date_time_unique.isoformat(),
                        'BirdDetect': None,
                        'Accuracy': None,
                        'BirdLabel': None,
                        'serial_number': serial_number,
                        'FoodWeight': round(Decimal(weight_food), 2),
                        'Temperature': round(Decimal(temperature), 2),
                        'ImageFileName': None,
                        'UploadDate': current_date,
                        'UploadTimestamp': current_timestamp,
                    }
                )
                print(f"Weights and temperature are uploaded to DynamoDB {current_timestamp}, {round(weight_food, 2)}g, {round(temperature, 2)}C")

                # Update last update time
                last_update_time = current_time

            except ClientError as e:
                print('Error occurred during AWS operation.')
                print(e)
            except Exception as e:
                print(e)

        time.sleep(0.1)  # Sleep for 0.1 seconds before next iteration

bird_detect_fn()

import datetime
import random
from decimal import Decimal
import threading
import time
import boto3
import os
import requests
from botocore.exceptions import ClientError
import copy

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

# Extend the shared dictionary to include the previous data
latest_data = {
    "current": {
        "weight_food": None,
        "temperature": None,
        "time": None,
    },
    "previous": {
        "weight_food": None,
        "temperature": None,
        "time": None,
    }
}

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

bird_detect = 0  # Global variable to hold bird detection status, 0 means no bird detected, 1 means bird detected
# Lock for synchronizing access to the shared data
data_lock = threading.Lock()

def WT_data():
    global bird_detect  # Use the global variable
    weight_food = round(Decimal(200.0),1)
    current_weight = 200.0
    current_temperature = 22.0

    # Set datetime---------------------------------------------------------------------------
    current_date_time_unique = datetime.datetime(2024, 1, 13, 4, 0, 0)
    increment = datetime.timedelta(minutes=5)

    while True:
        # Update current data
        current_date = current_date_time_unique.strftime("%Y-%m-%d")
        current_timestamp = current_date_time_unique.strftime('%H:%M:%S')

        if bird_detect:  # weight_food update only when bird is detected
            weight_food = round(random.choices([Decimal(current_weight), Decimal(max(50.0, random.uniform(current_weight-20, current_weight)))],
                                           weights=[0.05, 0.95])[0], 1)
            current_weight = float(weight_food)
        

        temperature = round(random.choices([Decimal(current_temperature), Decimal(min(10.5, max(7.1, random.uniform(current_temperature-0.5, current_temperature+0.5))))],
                                           weights=[0.6, 0.4])[0], 1)
        current_temperature = float(temperature)

        with data_lock:
            # Move current data to previous
            latest_data["previous"] = latest_data["current"].copy()
            # Update current data
            latest_data["current"].update({
                "weight_food": current_weight,
                "temperature": current_temperature,
                "time": current_date_time_unique.isoformat(),
            })
        
        try:   
            # Add entry to DynamoDB
            # Initially always set BirdDetect to 0
            # Update bird detect in sever code after prediction
            table.put_item(
                Item={
                    'UploadDateTimeUnique':current_date_time_unique.isoformat(),
                    'BirdDetect': None,
                    'Accuracy': None,
                    'BirdLabel': None,
                    'serial_number': serial_number,
                    'FoodWeight': weight_food,
                    'Temperature': temperature,
                    'ImageFileName': None,
                    'UploadDate': current_date,
                    'UploadTimestamp': current_timestamp,
                }
            )

            print(f"Weights and temperature are uploaded to dynamodb {current_timestamp}, {weight_food}")

        except ClientError as e:
            print('Error occurred during AWS operation.')
            print(e)
        except Exception as e:
            print(e)

        current_date_time_unique += increment
        time.sleep(0.2)  # Simulate work

def read_latest_data():
    global bird_detect  # Use the global variable
    images = []
    data_file_folder = os.path.join(os.getcwd(), "images")
    for file in os.listdir(data_file_folder):
        if not file.startswith('~') and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            images.append(file)
    print(images)

    while(True):
        bird_detect = random.choices([0,1], weights=[0.9, 0.1])[0]
        print(f"BirdDetect: {bird_detect}")

        if bird_detect:
            with data_lock:
                # Safely copy the data for use
                current_data = copy.deepcopy(latest_data["current"])
                previous_data = copy.deepcopy(latest_data["previous"])
            '''
            if current_data["weight_food"] is not None:  # Check if there's any data
                print(f"Current Data: {current_data}")
                print(f"Previous Data: {previous_data}")

            '''
            
            if current_data["weight_food"] is not None and previous_data["weight_food"] is not None:
                # random image generator
                img = random.randint(0, len(images)-1)
                image_file_name = images[img]
                
                # Generate random weight in the range
                weight_min = min(current_data["weight_food"], previous_data["weight_food"])
                weight_max = max(current_data["weight_food"], previous_data["weight_food"])
                weight = round(Decimal(random.uniform(weight_min, weight_max)), 1)
                
                # Generate random temperature in the range
                temperature_min = min(current_data["temperature"], previous_data["temperature"])
                temperature_max = max(current_data["temperature"], previous_data["temperature"])
                temperature = round(Decimal(random.uniform(temperature_min, temperature_max)), 1)
                
                # Calculate a random time point between the current and previous time
                current_time = datetime.datetime.fromisoformat(current_data["time"])
                previous_time = datetime.datetime.fromisoformat(previous_data["time"])
                fraction = random.uniform(0, 1)
                random_time_delta = (current_time - previous_time) * fraction
                random_time_point = previous_time + random_time_delta
                
                # Correctly format the datetime object without unnecessary conversion
                current_date = random_time_point.strftime("%Y-%m-%d")
                current_timestamp = random_time_point.strftime('%H:%M:%S')

                time.sleep(0.25)            
                bird_detect = 0 

                try: 
                    #stop = False
                    #time.sleep(3)         
                    # Upload fake images to s3 bucket          
                    file_path = os.path.join(data_file_folder, image_file_name)
                    print(f"Uploading file {image_file_name} ....")
                    client_s3.upload_file(file_path, bucket_name, image_file_name)
                    
                    # Add entry to DynamoDB
                    # Initially always set BirdDetect to 0
                    # Update bird detect in sever code after prediction
                    table1.put_item(
                        Item={
                            'UploadDateTimeUnique':random_time_point.isoformat(),
                            'BirdDetect': Decimal(0),
                            'Accuracy': None,
                            'BirdLabel': None,
                            'serial_number': serial_number,
                            'FoodWeight': weight,
                            'Temperature': temperature,
                            'ImageFileName': image_file_name,
                            'UploadDate': current_date,
                            'UploadTimestamp': current_timestamp,
                        }
                    )

                    print(f"Weights, Temperature, and Imagepath are uploaded to dynamodb {current_timestamp}, {weight}, {image_file_name}")
                    
                    image_url_cur = image_url + "/" + image_file_name
                    image_url_cur = image_url + "/" + image_file_name
                    send_prediction_request(server_url, image_url_cur, random_time_point.isoformat())

                    
                except ClientError as e:
                    print('Error occurred during AWS operation.')
                    print(e)
                except Exception as e:
                    print(e)

                print(f"Random Weight: {weight}")
                print(f"Random Temperature: {temperature}")
                print(f"Random Time: {random_time_point}")       

        time.sleep(0.8)  # Simulate processing time

# Start threads
producer_thread = threading.Thread(target=WT_data)

producer_thread.start()
time.sleep(5)
read_latest_data()

# Join threads to ensure cleanup (assuming you have a mechanism to exit the loops)
# producer_thread.join()
# consumer_thread.join() or signal it to stop based on your application logic

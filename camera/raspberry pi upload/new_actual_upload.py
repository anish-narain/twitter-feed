import datetime
import random
from decimal import Decimal
import threading
import time
import boto3
import os
import requests
from botocore.exceptions import ClientError

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


def WT_data():

    while True:
        
        """
        Actual weight and temperature
        weight_food
        temperature
        """
        
        try:   
            # Update current data
            current_date_time_unique = datetime.datetime.now()
            current_date = current_date_time_unique.strftime("%Y-%m-%d")
            current_timestamp = current_date_time_unique.strftime('%H:%M:%S')

            # Add entry to DynamoDB
            # Initially always set BirdDetect to 0
            # Update bird detect in sever code after prediction
            table.put_item(
                Item={
                    'UploadDateTimeUnique':current_date_time_unique.isoformat(),
                    'UploadDate': current_date,
                    'UploadTimestamp': current_timestamp,
                    'BirdDetect': None,
                    'FoodWeight': weight_food,
                    'Temperature': temperature,
                    'ImageFileName': None
                }
            )

            print(f"Weights and temperature are uploaded to dynamodb {current_timestamp}, {weight_food}")

        except ClientError as e:
            print('Error occurred during AWS operation.')
            print(e)
        except Exception as e:
            print(e)

        time.sleep(5*60)  # sleep 5 minutes

def read_latest_data():    
    while(True):
        #get weight bird

        if weight_bird > 20 and bird_detect == 0:  ## first detect bird
            bird_detect = 1

            # Update current data
            current_date_time_unique = datetime.datetime.now()
            current_date = current_date_time_unique.strftime("%Y-%m-%d")
            current_timestamp = current_date_time_unique.strftime('%H:%M:%S')

            '''
            call camera to capture a picture and save it into folder data_file_folder

            image_file_name = "Image_"+ current_timestamp   # fake image file name, has to be unique!!!

            get weight, temperature
            '''            

            try: 
                # Upload image to s3 bucket          
                file_path = os.path.join(data_file_folder, image_file_name)
                print(f"Uploading file {image_file_name} ....")
                client_s3.upload_file(file_path, bucket_name, image_file_name)
                
                # Add entry to DynamoDB
                # Initially always set BirdDetect to 0
                # Update bird detect in sever code after prediction
                table1.put_item(
                    Item={
                        'UploadDateTimeUnique':current_date_time_unique.isoformat(),
                        'UploadDate': current_date,
                        'UploadTimestamp': current_timestamp,
                        'BirdDetect': Decimal(0),
                        'FoodWeight': weight,
                        'Temperature': temperature,
                        'ImageFileName': image_file_name
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

            time.sleep(5)  # Detect for bird every 5 second

        elif weight_bird > 20 and bird_detect == 1:  # if previous is bird detect
            time.sleep(5)
        
        else:                           # if weight bird < 20, reset bird detect to 0
            bird_detect = 0

        

# Start threads
producer_thread = threading.Thread(target=WT_data)

producer_thread.start()
time.sleep(5)
read_latest_data()

# Join threads to ensure cleanup (assuming you have a mechanism to exit the loops)
# producer_thread.join()
# consumer_thread.join() or signal it to stop based on your application logic

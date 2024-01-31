import random
import time
import boto3
import datetime
from botocore.exceptions import ClientError
from decimal import Decimal
import os
import requests



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

# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "images")

if not os.path.exists(data_file_folder):
    os.makedirs(data_file_folder)

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

# Example usage
server_url = 'http://18.209.102.29:5000'  # Replace with your server's IP and port
image_url = 'https://twitterbirdbucket.s3.amazonaws.com'  # Replace with your image URL
primary_key_value = '2024-01-29T21:25:06.837403'  # Replace with the appropriate primary key value


while True:

    # Generate a random choice between 0-80 and 80-1500 based on the 70%, 30%
    weight_bird = round(random.choices([random.uniform(0.0, 80.0), random.uniform(80.0, 1500.0)], 
                             weights=[0.6, 0.4])[0] ,5)

    # random brid weight from 0 to 1500g
    weight_food = round(Decimal(random.uniform(20.0, 700.0)),5)   # random food weight from 20.0g to 700.0g

    if weight_bird > 80:
        bird_detect = Decimal(1)

        '''
        call camera to capture a picture and save it into folder data_file_folder

        image_file_name = "Image_"+ current_timestamp   # fake image file name, has to be unique!!!
        '''
        
   
    else:
        bird_detect = Decimal(0)

    print("Bird's weight:", weight_bird)
    print(f"Bird_detect: {bird_detect}")
    print(f"Left over food: {weight_food}")
    
    try:
        # Get current date in YYYY-MM-DD format and current timestamp in ISO 8601 format
        current_date_time_unique = datetime.datetime.now().isoformat()
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")
        current_timestamp = datetime.datetime.now().strftime('%H:%M:%S')

        """
        # Create fake image file name
        if bird_detect:
            image_file_name = "Image_"+ current_date+ "_" + current_timestamp + ".jpg"   # fake image file name, has to be unique!!!
        else:
            image_file_name = "None"

        """

        '''
        Take a picture and save to folder images

        ---------------------------------------------------------------------------
        '''
        
        # upload image to s3 bucket
        # predetemined 
        if bird_detect:
            image_file_name = '1.jpg'
            file_path = os.path.join(data_file_folder, image_file_name)

            print(f"Uploading file {image_file_name} ....")
            client_s3.upload_file(file_path, bucket_name, image_file_name)
        else:
            image_file_name = None
        
        # Add entry to DynamoDB
        # Initially always set BirdDetect to 0
        # Update bird detect in sever code after prediction
        response = table.put_item(
            Item={
                'UploadDateTimeUnique':current_date_time_unique,
                'UploadDate': current_date,
                'UploadTimestamp': current_timestamp,
                'BirdDetect': Decimal(0),
                'FoodWeight': weight_food,
                'ImageFileName': image_file_name
            }
        )

        print(f"Weights and detection are uploaded to dynamodb")

        # start running prediction on the server
        if bird_detect:
            image_url_cur = image_url + "/" + image_file_name
            print("hahahahahah")
            send_prediction_request(server_url, image_url_cur, current_date_time_unique)
            print("hahaha")

    except ClientError as e:
        print('Error occurred during AWS operation.')
        print(e)
    except Exception as e:
        print(e)
    
    time.sleep(5)
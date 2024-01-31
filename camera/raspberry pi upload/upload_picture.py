import os
import boto3
from botocore.exceptions import ClientError
import datetime

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
table = dynamodb.Table('upload_image_name')  # Replace with your actual DynamoDB table name

# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "images")

for file in os.listdir(data_file_folder):
    if not file.startswith('~') and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
        try:
            file_path = os.path.join(data_file_folder, file)
            print(f"Uploading file {file} ....")
            client_s3.upload_file(file_path, bucket_name, file)

            # Get current date in YYYY-MM-DD format and current timestamp in ISO 8601 format
            current_date = datetime.datetime.now().strftime("%Y-%m-%d")
            current_timestamp = datetime.datetime.now().isoformat()

            # Add entry to DynamoDB
            response = table.put_item(
               Item={
                    'UploadDate': current_date,
                    'UploadTimestamp': current_timestamp,
                    'FileName': file
                }
            )
            print(f"File info for {file} stored in DynamoDB.")

        except ClientError as e:
            print('Error occurred during AWS operation.')
            print(e)
        except Exception as e:
            print(e)

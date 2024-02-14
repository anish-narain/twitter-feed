import boto3
from tqdm import tqdm
from boto3.dynamodb.conditions import Attr

# AWS S3 setup
access_key = "AKIATO4ZT6IXMKE6KWXZ"  # Replace with your actual access key
access_secret = "sh4WMN8MbRKmGNE9O8/prTZqzT3W9mq/rxJ7S7bH"  # Replace with your actual secret key
region_name = 'us-east-1'

# AWS DynamoDB setup
# AWS DynamoDB setup
dynamodb = boto3.resource('dynamodb', 
    aws_access_key_id=access_key, 
    aws_secret_access_key=access_secret,
    region_name=region_name
)

table = dynamodb.Table('Twitter_Table_New')

response = table.scan(
    FilterExpression=Attr('UploadDate').between('2024-01-01', '2024-01-03')
)

print("All items get")

items = response['Items']

for item in tqdm(items):
    table.update_item(
        Key={
            'UploadDateTimeUnique': item['UploadDateTimeUnique']
        },
        UpdateExpression='SET serial_number = :val',
        ExpressionAttributeValues={
            ':val': 'AA888888'
        }
    )

print("Update Finished")
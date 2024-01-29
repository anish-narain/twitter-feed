import os
import requests
import json
import datetime

# Directory containing the images
data_file_folder = os.path.join(os.getcwd(), "images_new")

for file in os.listdir(data_file_folder):
    if not file.startswith('~') and file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
        try:
            file_path = os.path.join(data_file_folder, file)
            print(f"Uploading file {file} ....")

            # Get current date in YYYY-MM-DD format and current timestamp in ISO 8601 format
            current_date = datetime.datetime.now().strftime("%Y-%m-%d")
            current_timestamp = datetime.datetime.now().isoformat()

            # Prepare data for the HTTP request
            payload = {
                'fileName': file,
                'uploadDate': current_date,
                'uploadTimestamp': current_timestamp,
                'fileContent': open(file_path, 'rb').read()
            }

            # Make a POST request to the Node.js server
            response = requests.post('http://3.85.198.193:5001/upload', data=json.dumps(payload), headers={'Content-Type': 'application/json'})

            if response.status_code == 200:
                print(f"File info for {file} stored in DynamoDB.")
            else:
                print(f"Failed to upload file {file}. Server response: {response.text}")

        except Exception as e:
            print(e)

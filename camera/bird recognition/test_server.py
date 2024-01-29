import requests

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
image_url = 'https://idkw.s3.eu-west-2.amazonaws.com/2.jpg'  # Replace with your image URL
primary_key_value = '2024-01-29T21:25:06.837403'  # Replace with the appropriate primary key value

print("hahahahahah")

send_prediction_request(server_url, image_url, primary_key_value)

print("hahaha")

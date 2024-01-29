# Twitter


## Camera part:

* A baseline for uploading random jpg image to S3 bucket (image storage AWS database) is estalished
* A dynamodb database for storing time of upload(time of detection of birds) and file name is established
* A proper way of extracting the dynamodb information to node.js is created, with a proper image url and timestamp
* A rough display is made in react to display the images according to timestamp order

A rough pipeline made - 01/21/24 (tired)


## Bird prediction part:
server code: run `inference_server_code_queue.py` on ec2 instance with `bird_model_copy.py` a must dependency.

client code: `create_fake_input_with_prediction.py` which uploads images from folder `images` and call the server code to make predictions

Bird prediction pipeline roughly finished - 01/29/24 
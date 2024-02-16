<img width="250" alt="image" src="https://github.com/anish-narain/twitter-feed/assets/69715492/ae4c6892-212c-4b61-b6ec-3f0d78a7c95f">

# Twitter Feed
Twitter Feed is an **IOT device** using sensors, **AWS**, **Node.js** and **React**. Twitter Feed is a smart bird feeder that can **seamlessly detect the presence of birds using a dedicated weight sensor**, and simultaneously **take a picture that can be stored in an interactive web app**. 
* Twitter Feed can **predict the breed of bird** from the picture to various degrees of accuracy using a trained ML model and present data from previous days in dynamic graphs.
* Twitter Feed also **tracks the weight of your bird feed** at 5-second intervals and alerts you when food is below 50g.
* Twitter Feed keeps a **history of the time of day and temperature (using a temperature sensor) of when each breed is detected**, so you can have the best chance of seeing the bird in person.
* Twitter Feed uses a secure **AWS authentication system** where each user logs in with a unique username and password (with secure communication using AWS secret keys). **Multiple users** can be registered on one Twitter Feeder, and a **single user can access multiple feeders** in different locations by entering the Bird Feeder Serial ID when accessing the web app, allowing for scalability.


## Website

The promotional website for the product can be found [here](https://riyachard.wixsite.com/twitterfeed).

Here is the [marketing video link](http://www.youtube.com/watch?v=lOHj0jQQYi0).


## Running the Code
Server code: To run the prediction server which identifies the bird breeds, run `python3 prediction-server.py` on ec2 instance with `bird_model.py` as the dependency in the `bird-recognition-server/server` folder. The main server which interfaces with the DynamoDB table, S3 bucket and React app is in the `main-server` folder. It also runs on an ec2 instance and can be run using `node server.js` 

Web-app code: To run the React application, go into the `react-app/amplifyapp/Frontend/src` folder and run `npm start`.

Client code: In `raspberry-pi`, go into `populating-dynamo-db` and run `python3 fake-upload.py` to populate the DynamoDB table systematically with data that can be used for bird trends and historical information. The `main.py` raspberry pi code used in the demo can be found in `raspberry-pi/demo`

## Contents of Our Folders

| Folder | File | Description |
|----------|----------|----------|
| bird-recognition-server | bird_images | These are test images for testing the bird prediction |
| bird-recognition-server | local | Contains the pretrained bird identification model. This folder has code for testing the bird prediction on our local devices. |
| bird-recognition-server | server | Also contains the pretrained bird identification model. This folder has the code that was run on our bird prediction AWS server.|
| main-server | bird_images | Contains the code for the AWS server which fetches data from our DynamoDB table and interfaces with our react application. |
| react-app/amplifyapp | Frontend | Contains our React App code with AWS Amplify for authentication. |
| raspberry-pi | README.md | Contains the descriptions of the files in this folder. |

The main server handles requests from client App and filter the Database Table and send back the requested data to client App. For all features, please check the description in file `new_testing_sensor_table.js`.

## React App Frontend
Main Dashboard showing birds detected and the breed predictions.
<img width="900" alt="image" src="https://github.com/anish-narain/twitter-feed/assets/69715492/601bac5d-e75f-4d1c-a3d2-f33ff7e30237">

Identifying trends for different types of birds.

<img width="600" alt="image" src="https://github.com/anish-narain/twitter-feed/assets/69715492/f7269707-8cae-46fa-bdb4-a6cfbc82abc7">


## AWS Database
1. Twitter_Table_New: stores all the data

<img width="1277" alt="image" src="https://github.com/anish-narain/twitter-feed/assets/69715492/c186ae9b-0a63-46da-bddc-04042a2ead7b">


2. Twitter_User_Table: binds user_id and bird_feeder's serial number





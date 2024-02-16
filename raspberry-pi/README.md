## Rasberry Pi

Contains the code running on the Rasberry Pi, there are two files:

### upload
The Actual Data Upload Pipeline is in a single super loop, with `time` function handling faster and slower procedure. We used a super loop as it had little impact on latency. The bird detection sensor is constantly checking if a bird visists while the food weight and temperature sensor send the data every 5 seconds to the server for monitoring the change in data.

We did try to separate the faster and slower features into two separate threads. However, it seems like the the two weight data sensors are communicating to the same I2C ADC chips, so the data cannot be send in parallel.

**Main** `Main.py` 

**Weight Sensor** `weightSensor.py`   
* Two weight sensors: food weight and bird detection
* Create bus pipeline with two sensors and process weight data

**Temperature Sensor** `tempSensor.py` 

### populating-dynamo-db
The Fake Data Upload Pipeline runs in two separate threads. The main thread handles bird detection in real time with weight and temperature data and another thread handles weight and temperature upload every 5 minutes.

The following random generators produce some kind of "fake real" weight and temperature data:
```python
weight_food = round(random.choices([Decimal(current_weight), 
                    Decimal(max(50.0, random.uniform(current_weight-20, current_weight)))],
                    weights=[0.05, 0.95])[0], 1)
            

temperature = round(random.choices([Decimal(current_temperature), 
                    Decimal(min(10.5, max(7.1, random.uniform(current_temperature-0.5, current_temperature+0.5))))],
                    weights=[0.6, 0.4])[0], 1)
```
We tried to run prediction locally on raspberry pi after detecting a bird and send the whole package to the database. However, the ML network is so large that the inference time for a single picture on raspberry pi takes more than 15 minutes. Thus, we used a separate server for bird detection which takes around 40 seconds to make a single prediction.

The server code structured to process the data in a queue and asynchronously running on the server so that it doesn't cause the upload procedure to wait until prediction finishes.

Good performance on Internet images, becuase the network is trained on those images, with over 95% of accuracy. **Poor performance on actual images taken from the bird feeder. Could retrained a network based on the actual images to improve performance.**

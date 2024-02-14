# Uses ADS1115 chip to measure weight with load cells. Takes photo when bird detected.

import smbus2
import time
from picamera import PiCamera
import tempSensor
import datetime
import os

keepCamera = False # Set to True to keep camera always initialised. Set to false to only create camera object when taking photo, less I2C interference.

class ADC:

    # https://www.ti.com/lit/ds/symlink/ads1114.pdf

    def __init__(self, address, bus):
        self.address = address # I2C address of device
        self.bus = bus # I2C bus

        self.mux = "000" # Which measurement to make, page 28 of data sheet
        self.range = "010" # Voltage range, smaller range is more sensitive, page 28 of data sheet
        self.mode = "1" # 0 = continuous, 1 = single measurement

        # Config register holds 16-bits
        self.configData = [0b10000101, 0b10000011] # status[1], MUX[3], range[3], mode[1],,,, data rate[3], comparator settings[5]

    def setConfig(self, MUX, range, mode, write=True): # Set the config register

        self.mux = MUX
        self.range = range
        self.mode = mode

        bitlist = list("1" + MUX + range + mode) # Creates first 8-bits of config data as a list
        out = 0
        for bit in bitlist:
            out = (out << 1) | int(bit) # Turns list into binary number

        self.configData[0] = out

        if write: # Write new configuration to device
            writeConfig = smbus2.i2c_msg.write(self.address, [0b00000001, self.configData[0], self.configData[1]]) # Set to register 0x01 (config register), and provide data to write
            writePointer = smbus2.i2c_msg.write(self.address, [0b00000000]) # Set address pointer to conversion register (so it's set up for later use)
            
            # Execute commands
            self.bus.i2c_rdwr(writeConfig)
            time.sleep(0.1)
            self.bus.i2c_rdwr(writePointer)

    def read(self): # Read value from ADC

        if self.mode == "1": # If in single measurement mode, have to re-write config register every time (to set status bit to 1)
            writeConfig = smbus2.i2c_msg.write(self.address, [0b00000001, self.configData[0], self.configData[1]]) # config register address, MSB of data, LSB of data
            writePointer = smbus2.i2c_msg.write(self.address, [0b00000000]) # Set address pointer to conversion register

        readPointer = smbus2.i2c_msg.read(self.address, 2) # Regardless of mode, have to read from conversion register to get result

        # Execute commands
        if self.mode == "1":
            self.bus.i2c_rdwr(writeConfig)
            time.sleep(0.01)
            self.bus.i2c_rdwr(writePointer)
            time.sleep(0.01)

        self.bus.i2c_rdwr(readPointer)

        data = int.from_bytes(readPointer.buf[0] + readPointer.buf[1], "big") # Read 2 bytes

        return data

def measure2(sensorObject): # Takes single reading from sensor 2
    sensorObject.setConfig("011", "111", "0", write=True) # Set to measure AN1 - AN2, with max gain.
    w = sensorObject.read()
    sensorObject.setConfig("100", "001", "0", write=True) # Set back to measure first sensor
    return w

def measure2_g(sensorObject): # Returns weight reading froms sensor 2 in grams
    global cal_sensor2_0, cal_sensor2_weight

    sensorObject.setConfig("011", "111", "0", write=True) # Set to measure AN1 - AN2, with max gain.

    total = 0
    samples = 50
    for i in range(int(samples)):
        total += sensorObject.read()

    w_g = ((total / float(samples)) - cal_sensor2_0) / float(cal_sensor2_weight)

    sensorObject.setConfig("100", "001", "0", write=True) # Set back to measure first sensor
    return w_g

# calibrate ######################################
cal_sensor1_0, cal_sensor1_weight, cal_sensor2_0, cal_sensor2_weight = 0, 0, 0, 0
def calibrateSensors(sensorObject, mass, mass2=0): # Calibrates sensors with known mass to measure weight
    global cal_sensor1_0, cal_sensor1_weight, cal_sensor2_0, cal_sensor2_weight
    samples = 200

    if mass2 == 0:  # Can specify different calibration mass for sensor 2
        mass2 = mass

    input("Sensor 1 (amp, left, bird weight): ENTER to calibrate 0g: ")
    total_0 = 0
    for i in range(int(samples)):
        total_0 += sensorObject.read()
    cal_sensor1_0 = total_0 / float(samples) # Average ADC value with no load

    input(f"Sensor 1 (amp, left, bird weight): ENTER to calibrate {mass}g: ")
    total_40 = 0
    for i in range(int(samples)):
        total_40 += sensorObject.read()
    cal_40 = total_40 / float(samples)  # Average ADC value with known mass
    cal_sensor1_weight = (cal_40 - cal_sensor1_0) / float(mass) # Works out the equivalent mass in grams for a change in ADC value of 1

    sensorObject.setConfig("011", "111", "0", write=True) # Set to measure AN1 - AN2, with max gain.

    input("Sensor 2 (right, food weight): ENTER to calibrate 0g: ")
    total_0 = 0
    for i in range(int(samples)):
        total_0 += sensorObject.read()
    cal_sensor2_0 = total_0 / float(samples)

    input(f"Sensor 2 (right, food weight): ENTER to calibrate {mass2}g: ")
    total_40 = 0
    for i in range(int(samples)):
        total_40 += sensorObject.read()
    cal_40 = total_40 / float(samples)
    cal_sensor2_weight = (cal_40 - cal_sensor2_0) / float(mass2)

    sensorObject.setConfig("100", "001", "0", write=True) # Set to default measurement

    print("Done")
    ##################################################

if keepCamera:
    camera = PiCamera()
    camera.rotation = 180

lastSamples = [] # List of previous n weight samples
lastDetect = 0 # Time of last detection
samples = 25 # No of samples to take per reading



def loop(sensorObject, threshold): # Constantly check sensor to see if a bird has landed, and take a photo if it has. Threshold = increase in weight required to detect bird (ADC value, not in grams).
    global lastSamples, lastDetect, samples, cal_sensor1_0, cal_sensor1_weight
    
    current_date_time_unique = datetime.datetime.now()
    image_file_name = ''
    file_path = ''

    total = 0
    for i in range(int(samples)):
        total += sensorObject.read()
    w = total/float(samples) # Averages readings
    w_g = ((total / float(samples)) - cal_sensor1_0) / float(cal_sensor1_weight) # Weight in grams

    lastSamples.append(w)
    if len(lastSamples) > 10: # Stores last n samples
        lastSamples.pop(0)
    last_avg = sum(lastSamples) / float(len(lastSamples)) # Average of last n samples

    detected = False
    if w > last_avg + threshold: # If most recent reading is significantly higher than average of last readings, a bird has landed
        
        if time.time() - lastDetect > 1: # Won't trigger within 1s of a previous detection
            # Directory containing the images
            data_file_folder = os.path.join(os.getcwd(), "images")

            if not os.path.exists(data_file_folder):
                os.makedirs(data_file_folder)

            print("Detected")
            detected = True

            image_file_name = "Image_"+ current_date_time_unique.isoformat()+".jpg"   # fake image file name, has to be unique!!!
            file_path = os.path.join(data_file_folder, image_file_name)

            # Takes photo
            if keepCamera:
                camera.capture(file_path)
            else:
                with PiCamera() as camera:
                    camera.rotation = 180
                    camera.capture(file_path)
            #time.sleep(0.5)
        
        lastDetect = time.time()
        lastSamples = [w] * len(lastSamples) # Sets the new average of previous samples to the current value

    # w = ADC reading, w_g = weight in grams, detected = True when photo taken
    return (w, w_g, detected, current_date_time_unique, image_file_name, file_path)

if __name__ == "__main__":
    i2c_bus = smbus2.SMBus(1) # Initialise I2C bus
    weight1 = ADC(0x48, i2c_bus)
    weight1.setConfig("100", "001", "0", write=True) # Set voltage range to smallest, i.e. most sensitive. No need to write new config as it will be done when reading ADC.

    calibrateSensors(weight1, 231)
    while True:
        d = loop(weight1, 200)
        print(d[0], d[1], measure2_g(weight1))

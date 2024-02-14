import smbus2
import weightSensor
import tempSensor

i2c_bus = smbus2.SMBus(1)

weight1 = weightSensor.ADC(0x48, i2c_bus) # ADC on address 0x48
weight1.setConfig("100", "001", "0", write=True) # Set voltage range to smallest, i.e. most sensitive. Set to continuous read mode, so need to write new config now.
weightSensor.calibrateSensors(weight1, mass=231, mass2=369)

while True:
    (w, w_g, bird_detect, capture_time, image_file_name, file_path) = weightSensor.loop(weight1, 80)
    w2 = weightSensor.measure2_g(weight1)
    print(w_g, w2, tempSensor.readTemp(i2c_bus))

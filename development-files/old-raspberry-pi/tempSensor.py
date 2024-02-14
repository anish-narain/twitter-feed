import time
import smbus2

# https://www.silabs.com/documents/public/data-sheets/Si7021-A20.pdf

# Setup I2C bus
si7021_ADD = 0x40
si7021_READ_TEMPERATURE = 0xF3
def readTemp(bus):

    cmd_meas_temp = smbus2.i2c_msg.write(si7021_ADD, [si7021_READ_TEMPERATURE])
    read_result = smbus2.i2c_msg.read(si7021_ADD, 2)

    # Execute commands
    bus.i2c_rdwr(cmd_meas_temp)
    time.sleep(0.1)
    bus.i2c_rdwr(read_result)

    # Calculate temperatures
    temperature = int.from_bytes(read_result.buf[0]+read_result.buf[1],'big') # Each byte is a 'string' type so using + will concatenate them together. 'big' means the left-most byte is the largest.
    tempC = ((175.72*temperature)/65536) - 46.85
    return tempC
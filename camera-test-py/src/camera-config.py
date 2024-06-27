from picamera2 import Picamera2
from keyboard import is_pressed
from PIL import Image
import io
from services import *

picam2 = Picamera2()

# refer to https://github.com/raspberrypi/picamera2/blob/main/examples/still_capture_with_config.py

# set img quality -- JPEG highest is 95, PNG no compression is 0
picam2.options["quality"] = 95
picam2.options["compress_level"] = 0

# camera controls -- can be configured
# print('camera_controls', picam2.camera_controls)
# {'AeFlickerMode': (0, 1, 0), 'ExposureValue': (-8.0, 8.0, 0.0), 'AeFlickerPeriod': (100, 1000000, None), 'AeExposureMode': (0, 3, 0), 'AeConstraintMode': (0, 3, 0), 'HdrMode': (0, 4, 0), 'AwbEnable': (False, True, None), 'ColourGains': (0.0, 32.0, None), 'StatsOutputEnable': (False, True, None), 'NoiseReductionMode': (0, 4, 0), 'Saturation': (0.0, 32.0, 1.0), 'FrameDurationLimits': (33333, 120000, None), 'ScalerCrop': ((0, 0, 0, 0), (65535, 65535, 65535, 65535), (0, 0, 0, 0)), 'AeEnable': (False, True, None), 'AnalogueGain': (1.0, 16.0, None), 'Contrast': (0.0, 32.0, 1.0), 'Sharpness': (0.0, 16.0, 1.0), 'AwbMode': (0, 7, 0), 'ExposureTime': (0, 66666, None), 'AeMeteringMode': (0, 3, 0), 'Brightness': (-1.0, 1.0, 0.0)}

# preview_configuration is for the preview that you see on the screen
picam2.preview_configuration.size = (450, 800)
picam2.preview_configuration.format = "YUV420"

# taking 900 x 1600 px img
picam2.still_configuration.size = (900, 1600)

# camera configurations -- when actually taking the image
# print(picam2.still_configuration)
# CameraConfiguration({'use_case': 'still', 'buffer_count': 1, 'transform': <libcamera.Transform 'identity'>, 'display': None, 'encode': None, 'colour_space': <libcamera.ColorSpace 'sYCC'>, 'controls': <Controls: {'NoiseReductionMode': <NoiseReductionModeEnum.HighQuality: 2>, 'FrameDurationLimits': (100, 1000000000)}>, 'main': {'size': (900, 1600), 'format': 'BGR888', 'stride': None, 'framesize': None}, 'lores': None, 'raw': {'size': None, 'format': None, 'stride': None, 'framesize': None}, 'queue': True, 'sensor': {'output_size': None, 'bit_depth': None}})

# not sure what this does
picam2.still_configuration.enable_raw()
picam2.still_configuration.raw.size = picam2.sensor_resolution

picam2.start("preview", show_preview=True)

key_flag = False
photo_num = 0

try:
    while True:
        if is_pressed('p'):
            if key_flag is False:
                key_flag = True

            # Capture an image to a NumPy array
            np_image = picam2.switch_mode_and_capture_array("still")
            print('np_image', np_image)

            # Convert the NumPy array to a PIL Image to save for testing
            image = Image.fromarray(np_image.astype('uint8'), 'RGB')

            # Now you can convert it to binary as shown above
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            print('img_byte_arr', img_byte_arr[:100])

            # use the binary img and pass to api
            upload_img(img_byte_arr)

        else:
            key_flag = 0
        if is_pressed('q'):
            print("\rClosing camera...")
            break
        photo_num += 1
finally:
    picam2.stop_preview()
    picam2.stop()
    picam2.close()
    print('complete capture')
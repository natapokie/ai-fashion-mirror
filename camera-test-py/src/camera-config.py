import time
from picamera2 import Picamera2, Preview

picam2 = Picamera2()
# set img quality -- JPEG highest is 95, PNG no compression is 0
picam2.options["quality"] = 95
picam2.options["compress_level"] = 0

print('camera_controls', picam2.camera_controls)

# preview_configuration is for the preview that you see on the screen
picam2.preview_configuration.size = (800, 600)
picam2.preview_configuration.format = "YUV420"

# still_configuration is high-resolution still image
capture_config1 = picam2.create_still_configuration()

capture_config2 = picam2.create_still_configuration()
capture_config2.size = (1600, 1200)

picam2.start(Preview.QTGL, show_preview=True)

time.sleep(5)
print('capture_config1', capture_config1)
picam2.switch_mode_and_capture_file(capture_config1, "capture_config1.jpg")

time.sleep(5)
print('capture_config2', capture_config2)
picam2.switch_mode_and_capture_file(capture_config1, "capture_config1.jpg")

print('complete capture')
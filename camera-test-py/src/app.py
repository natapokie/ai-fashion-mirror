from picamera2 import Picamera2, Preview
import time
from services import *

# set up raspberry pi camera
picam2 = Picamera2()
camera_config = picam2.create_preview_configuration()
picam2.configure(camera_config)
picam2.start_preview(Preview.QTGL)

url = 'https://pre.cm/scribe.php'
img_path = 'test_'

# open the file -- make sure it exists
result_file = open('result.json', 'w')

# start the camera
picam2.start()

# take four photos and call api
for i in range(5):
    time.sleep(6)
    filename = f"{img_path}{i}.jpg"
    picam2.capture_file(filename)
    print(f"capture complete {filename}")

    upload_img_file(filename)

picam2.stop_preview()
print('images complete')
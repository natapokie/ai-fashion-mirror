from picamera2 import Picamera2, Preview
import time
import requests
import json

# set up raspberry pi camera
picam2 = Picamera2()
camera_config = picam2.create_preview_configuration()
picam2.configure(camera_config)
picam2.start_preview(Preview.QTGL)

url = 'https://pre.cm/scribe.php'
img_path = 'test_'

# open the file -- make sure it exists
result_file = open('result.json', 'w')


def upload_img(img_path, url=url):
    # Open the image file in binary mode
    with open(img_path, 'rb') as image_file:
        # Create a dictionary with the file to upload and additional form data
        files = {'imagepageim[]': image_file}
        data = {
            'socialfollow': '1000000',
            'socialtype': 'fashion',
            'api': 'api',
            'submit': 'submit'
        }

        # Send a POST request to the website with the image file and form data
        response = requests.post(url, files=files, data=data)

        # Check if the request was successful
        if response.status_code == 200:
            try:
                # Try to parse the JSON response
                json_response = response.json()

                # Save the JSON responses to a file
                # a for append
                with open("result.json", 'a') as json_file:
                    json_file.write(img_path)
                    json.dump(json_response, json_file, indent=4)
                    json_file.write("\n")

                print("Upload successful. JSON response saved to 'result.json'.")
            except requests.exceptions.JSONDecodeError as e:
                print("Failed to decode JSON response.")
                print(f"Response content: {response.text}")
        else:
            print(f"Upload failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")


# start the camera
picam2.start()

# take four photos and call api
for i in range(5):
    time.sleep(6)
    filename = f"{img_path}{i}.jpg"
    picam2.capture_file(filename)
    print(f"capture complete {filename}")

    upload_img(filename)

picam2.stop_preview()
print('images complete')
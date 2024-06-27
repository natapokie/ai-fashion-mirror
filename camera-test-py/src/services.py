from typing import BinaryIO
import requests
import json

URL = 'https://pre.cm/scribe.php'

# sends img (if saved to file) to api
def upload_img_file(img_path, url=URL):
    # Open the image file in binary mode
    with open(img_path, 'rb') as image_file:
        # Create a dictionary with the file to upload and additional form data
        upload_img(image_file)


def upload_img(img_binary: BinaryIO):
    files = {'imagepageim[]': img_binary}
    data = {
        'socialfollow': '1000000',
        'socialtype': 'fashion',
        'api': 'api',
        'submit': 'submit'
    }

    # Send a POST request to the website with the image file and form data
    response = requests.post(URL, files=files, data=data)

    # Check if the request was successful
    if response.status_code == 200:
        try:
            # Try to parse the JSON response
            json_response = response.json()

            # Save the JSON responses to a file
            # a for append
            with open("result.json", 'a') as json_file:
                json.dump(json_response, json_file, indent=4)
                json_file.write("\n")

            print("Upload successful. JSON response saved to 'result.json'.")
        except requests.exceptions.JSONDecodeError as e:
            print("Failed to decode JSON response.")
            print(f"Response content: {response.text}")
    else:
        print(f"Upload failed. Status code: {response.status_code}")
        print(f"Response: {response.text}")
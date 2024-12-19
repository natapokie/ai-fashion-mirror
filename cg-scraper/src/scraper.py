import requests

class Scraper:
    def __init__(self):
        self.base_url = "https://www.google.com/"

    def run(self):
        response = requests.get(self.base_url)
        if response.status_code == 200:
            print('Success!')
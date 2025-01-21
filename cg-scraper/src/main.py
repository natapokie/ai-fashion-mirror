import os
from dotenv import load_dotenv
from scraper import Scraper

# load .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "..", "..", ".env")
print(env_path)
load_dotenv(env_path)


def main():
    scraper = Scraper()
    scraper.run()


if __name__ == "__main__":
    main()

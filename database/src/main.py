import sys
import os
from scraper import Scraper
from sanitizer import Sanitizer
from db import DatabaseHelper


def main():
    # scrape data if "--s" flag is passed or if the output file does not exist
    if "--scrape" in sys.argv or not os.path.exists("data/output.csv"):
        print("Scraping data")
        scraper = Scraper()
        scraper.run()
    if "--sanitize" in sys.argv or not os.path.exists("data/cleaned_output.json"):
        print("Sanitizing data")
        sanitizer = Sanitizer()
        sanitizer.run()
    if "--upsert" in sys.argv:
        print("Upserting data")
        db = DatabaseHelper()
        db.upsert_handler()
    if "--describe" in sys.argv:
        db = DatabaseHelper()
        db.describe_index()
    if "--query" in sys.argv:
        db = DatabaseHelper()
        query = "canada goose"
        db.query_index(query)


if __name__ == "__main__":
    main()

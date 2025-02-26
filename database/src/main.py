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

    # sanitize data if "--sanitize" flag is passed or if the cleaned output file does not exist
    if "--sanitize" in sys.argv or not os.path.exists("data/cleaned_output.json"):
        print("Sanitizing data")
        sanitizer = Sanitizer()
        sanitizer.run()

    # upsert data if "--upsert" flag is passed
    if "--upsert" in sys.argv:
        print("Upserting data")
        db = DatabaseHelper()
        db.upsert_handler()

    # describe index if "--describe" flag is passed
    if "--describe" in sys.argv:
        db = DatabaseHelper()
        print(db.describe_index())

    # query index if "--query" flag is passed
    if "--query" in sys.argv:
        print("Querying index")
        db = DatabaseHelper()
        query = "red long jacket"
        print(db.query_index(query))


if __name__ == "__main__":
    main()

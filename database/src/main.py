import sys
import os
import argparse
from scraper import Scraper
from sanitizer import Sanitizer
from db import DatabaseHelper


def main():
    parser = argparse.ArgumentParser(description="Scrape Canada Goose data")
    parser.add_argument("--scrape", action="store_true", help="Run scraper")
    parser.add_argument("--sanitize", action="store_true", help="Run sanitizer")  # Add this line
    parser.add_argument(
        "--limit",
        type=int,
        nargs="?",
        const=0,
        default=0,
        help="Limit number of products",
    )
    parser.add_argument(
        "--remove-category", nargs="+", default=[], help="Categories to exclude"
    )
    args = parser.parse_args()

    # scrape data if "--scrape" flag is passed or if the output file does not exist
    if args.scrape or not os.path.exists("data/output.csv"):
        print("Scraping data")
        print(f"Removing categories: {args.remove_category}")  # Add this
        scraper = Scraper(limit=args.limit, remove_categories=set(args.remove_category))
        scraper.run()

    # sanitize data if "--sanitize" flag is passed or if the cleaned output file does not exist
    if args.sanitize or not os.path.exists("data/cleaned_output.json"):  # Change this line
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
        query = "canada goose"
        print(db.query_index(query))


if __name__ == "__main__":
    main()

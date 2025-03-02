import sys
import os
import argparse
from scraper import Scraper
from sanitizer import Sanitizer
from db import DatabaseHelper


def main():
    parser = argparse.ArgumentParser(description="Scrape Canada Goose data")
    parser.add_argument("--scrape", action="store_true", help="Run scraper")
    parser.add_argument("--sanitize", action="store_true", help="Run sanitizer")
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
    parser.add_argument("--upsert", action="store_true", help="Upsert data to database")
    parser.add_argument("--describe", action="store_true", help="Describe the index statistics")
    parser.add_argument("--delete-all-vectors", action="store_true", help="Delete all vectors from the index")
    parser.add_argument("--delete-index", action="store_true", help="Delete the entire index")
    parser.add_argument("--create-index", action="store_true", help="Create a new index")
    parser.add_argument("--query", type=str, help="Query the index with the given text")
    parser.add_argument("--index-name", type=str, help="Override the index name from .env")
    args = parser.parse_args()

    # Initialize database helper
    db = None

    # Create index if requested
    if args.create_index:
        print("Creating new index")
        db = DatabaseHelper(index_name=args.index_name)
        db.create_index()

    # Delete index if requested
    if args.delete_index:
        print("Deleting index")
        db = DatabaseHelper(index_name=args.index_name)
        db.delete_index()

    # Delete all vectors if requested
    if args.delete_all_vectors:
        print("Deleting all vectors from index")
        db = DatabaseHelper(index_name=args.index_name)
        db.delete_all_vectors()

    # scrape data if "--scrape" flag is passed or if the output file does not exist
    if args.scrape or not os.path.exists("data/output.csv"):
        print("Scraping data")
        print(f"Removing categories: {args.remove_category}")
        scraper = Scraper(limit=args.limit, remove_categories=set(args.remove_category))
        scraper.run()

    # sanitize data if "--sanitize" flag is passed or if the cleaned output file does not exist
    if args.sanitize or not os.path.exists("data/cleaned_output.json"):
        print("Sanitizing data")
        sanitizer = Sanitizer()
        sanitizer.run()

    # upsert data if "--upsert" flag is passed
    if args.upsert:
        print("Upserting data")
        if db is None:
            db = DatabaseHelper(index_name=args.index_name)
        db.load_data()
        db.upsert_handler()

    # describe index if "--describe" flag is passed
    if args.describe:
        print("Describing index")
        if db is None:
            db = DatabaseHelper(index_name=args.index_name)
        stats = db.describe_index()
        print(stats)

    # query index if "--query" flag is passed with a value
    if args.query:
        print(f"Querying index for: {args.query}")
        if db is None:
            db = DatabaseHelper(index_name=args.index_name)
        results = db.query_index(args.query)
        print(results)


if __name__ == "__main__":
    main()
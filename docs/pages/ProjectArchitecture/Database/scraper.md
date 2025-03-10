---
layout: default
title: Scraper
parent: Database
grand_parent: ProjectArchitecture
---

# Scraper

The scraper is responsible for collecting data from Canada Goose's website.

The script, `run_scaper.sh` facilitates web scraping, data sanitization, and database operations. It is designed to scrape data, clean it, and upsert it into a database. The script also allows querying and describing the database index.

## Prerequisites

Ensure Conda and other dependencies are installed.

## Setup

1. **Activate Conda Environment:**

   ```sh
   conda activate scraper
   ```

2. **Navigate to the Script Directory:**

   ```sh
   cd database/src
   ```

## Usage

Run the script with different flags to perform specific tasks:

### 1. Scraping Data

Scrape data and save it to `data/output.csv`:

```sh
python main.py --scrape
```

### 2. Sanitizing Data

Sanitize the scraped data and save it to `data/cleaned_output.json`:

```sh
python main.py --sanitize
```

### 3. Upserting Data into the Database

Upsert the cleaned data into the database:

```sh
python main.py --upsert
```

### 4. Describing the Database Index

Retrieve metadata about the database index:

```sh
python main.py --describe
```

### 5. Querying the Database

Perform a query on the database index with a default search term (`"canada goose"`):

```sh
python main.py --query
```

## Notes

- If `data/output.csv` does not exist, the script will automatically trigger scraping.
- If `data/cleaned_output.json` does not exist, the script will automatically trigger data sanitization.
- Ensure all dependencies required for the scraper, sanitizer, and database helper modules are installed within the Conda environment.


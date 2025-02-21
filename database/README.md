# Canada Goose Webscraper

## Environment Setup

This project uses the package manager [Conda](https://docs.conda.io/en/latest/) (specifically [Miniconda](https://docs.anaconda.com/miniconda/)). Installation guide found [here](https://educe-ubc.github.io/conda.html).

### Miniconda Installation

```bash
# download the miniconda installer
# for WSL, use the Linux distribution
curl -sL \
  "https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh" > \
  "Miniconda3.sh"

# for Mac, use the MacOS distribution
curl -sL \
  "https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh" > \
  "Miniconda3.sh"
```

```bash
# run the installer
bash Miniconda3.sh

# restart your terminal and update conda
conda update conda

# once installation is completed, you should notice a new folder called miniconda3
# you can now delete the installer
rm Miniconda3.sh
```

### Running Conda Environment

Conda environment specifications can be found in environment.yml.

```bash
# create a cnda environment based on the specifications provided in an environment.yml file.
conda env create -f environment.yml

# once the environment is installed
# activate the environment (name of the environment is scraper)
conda activate scraper

# deactivate the environment
conda deactivate
```


### Making Changes to the Conda Environment

Updating the conda environment,

```bash
cd database
conda env update --file environment.yml --prune
```

If you've installed new packages and want to update the environment.yml file,

```bash
conda env export > environment.yml
```

## Running the Scraper

### Running via Terminal

```bash
cd database/src
python main.py
```

### Running via VSCode Run Button

On VSCode make sure that your Python interpreter is set to the conda environment.
- Open the Command Palette (Ctrl + Shift + P or Cmd + Shift + P on Mac).
- Search for "Python: Select Interpreter" and select it.
- Choose the path corresponding to your Conda environment. The name will include the environment name, e.g., Python 3.12.8 ('scraper').



# Scraper
## Overview

This script facilitates web scraping, data sanitization, and database operations. It is designed to scrape data, clean it, and upsert it into a database. The script also allows querying and describing the database index.

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

# Unit Tests

## Running Unit Tests

Unit tests are run using [pytest](https://docs.pytest.org/en/stable/).

```bash
cd database
docker compose up -d
pytest

# or cd to the root
npm run test:database
```

## Creating Unit Tests

All unit test python files must start with `test` and be placed in the tests folder.
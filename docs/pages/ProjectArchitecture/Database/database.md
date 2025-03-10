---
layout: default
title: Database
parent: ProjectArchitecture
has_children: true
---


# Database

The database folder contains all the necessary scripts and configurations to manage the data storage and retrieval for the AI Fashion Mirror project. This includes web scraping scripts and integration with [Pinecone](https://www.pinecone.io/) for vector database management.

- [Running the Scraper](./scraper.md)

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

### Using the Shell Script

The project includes a convenient shell script that handles environment activation and provides a simplified interface for all operations.

To see all available commands and options:

```bash
./run_scraper.sh --help
```

This will display detailed information about all available flags, including:
- Scraping data
- Sanitizing data
- Managing Pinecone indices
- Querying the database
- And more

Example usage:

```bash
# Create a new index
./run_scraper.sh --create-index my-index

# Scrape data with a limit
./run_scraper.sh --scrape --limit 50

# Sanitize scraped data
./run_scraper.sh --sanitize

# Upload data to the index
./run_scraper.sh --upsert my-index

# Query the index
./run_scraper.sh --query "red jacket" my-index
```

The shell script handles Conda environment activation and deactivation automatically.

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


## Unit Tests

### Running Unit Tests

Unit tests are run using [pytest](https://docs.pytest.org/en/stable/).

```bash
cd database
docker compose up -d
pytest

# or cd to the root
npm run test:database
```

### Creating Unit Tests

All unit test python files must start with `test` and be placed in the tests folder.
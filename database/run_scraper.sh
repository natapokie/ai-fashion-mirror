#!/bin/bash

# Exit on error, but print the error message
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "Error: Conda is not installed. Please install Miniconda or Anaconda first."
    exit 1
fi

# Check if the "scraper" environment exists
if ! conda env list | grep -q "scraper"; then
    echo "Error: Conda environment 'scraper' not found."
    echo "Run the following command to create it:"
    echo "    conda env create -f environment.yml"
    exit 1
fi

# Activate the Conda environment
echo "Activating Conda environment: scraper"
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate scraper

# Ensure Pinecone is installed (not available via Conda)
if ! pip show pinecone &> /dev/null; then
    echo "Installing Pinecone via pip..."
    pip install pinecone
fi

# Initialize variables
declare -a REMOVE_CATEGORIES
LIMIT=0
SCRAPE=false
SANITIZE=false
UPSERT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --scrape)
            SCRAPE=true
            shift
            ;;
        --sanitize)
            SANITIZE=true
            shift
            ;;
        --upsert)
            UPSERT=true
            shift
            ;;
        --remove-category)
            shift
            while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                REMOVE_CATEGORIES+=("$1")
                shift
            done
            ;;
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        *)
            echo "Unknown parameter: $1"
            exit 1
            ;;
    esac
done

# Debug output
echo "Current directory: $(pwd)"
echo "Script directory: $SCRIPT_DIR"
echo "Parameters:"
echo "  SCRAPE: $SCRAPE"
echo "  SANITIZE: $SANITIZE"
echo "  UPSERT: $UPSERT"
echo "  LIMIT: $LIMIT"
echo "  REMOVE_CATEGORIES: ${REMOVE_CATEGORIES[*]}"

# Change to the src directory
cd "$SCRIPT_DIR/src"

# Ensure data directory exists
mkdir -p data

# Run the scraping process
if [[ "$SCRAPE" = true ]]; then
    echo "Running Scraper..."
    if [ ${#REMOVE_CATEGORIES[@]} -gt 0 ]; then
        # Pass all categories in a single --remove-category argument
        CATEGORY_ARGS="--remove-category ${REMOVE_CATEGORIES[*]}"
        echo "Command: python main.py --scrape --limit $LIMIT $CATEGORY_ARGS"
        python main.py --scrape --limit "$LIMIT" $CATEGORY_ARGS
    else
        echo "Command: python main.py --scrape --limit $LIMIT"
        python main.py --scrape --limit "$LIMIT"
    fi
fi

# Run the sanitization process
if [[ "$SANITIZE" = true ]]; then
    echo "Running Sanitizer..."
    python main.py --sanitize
fi

# Run the upsert process
if [[ "$UPSERT" = true ]]; then
    echo "Upserting Data to Database..."
    python main.py --upsert
fi

# Deactivate Conda environment after execution
conda deactivate
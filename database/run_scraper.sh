#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

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

# Move into the correct directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/src"

# Default values
LIMIT=0
REMOVE_CATEGORIES=()
REMOVE_CATEGORY_ARGS=()

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --scrape) SCRAPE=true ;;
        --sanitize) SANITIZE=true ;;
        --upsert) UPSERT=true ;;
        --remove-category) 
            shift  
            while [[ "$#" -gt 0 && ! "$1" =~ ^-- ]]; do
                REMOVE_CATEGORIES+=("$1")
                REMOVE_CATEGORY_ARGS+=("--remove-category" "$1")
                shift
            done
            ;;
        --limit) LIMIT="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Debugging output
echo "Running with parameters:"
echo "  SCRAPE: $SCRAPE"
echo "  SANITIZE: $SANITIZE"
echo "  UPSERT: $UPSERT"
echo "  LIMIT: $LIMIT"
echo "  REMOVE_CATEGORY_ARGS: ${REMOVE_CATEGORY_ARGS[@]}"

# Run the scraping process
if [[ "$SCRAPE" = true ]]; then
    echo "Running Scraper..."
    python main.py --scrape --limit "$LIMIT" "${REMOVE_CATEGORY_ARGS[@]}"
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
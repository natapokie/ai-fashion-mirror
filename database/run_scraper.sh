#!/bin/bash

# Exit on error, but print the error message
set -e

# Function to display help
display_help() {
    echo "Usage: ./run_scraper.sh [OPTIONS]"
    echo
    echo "Options:"
    echo "  --help                      Display this help message"
    echo "  --scrape                    Run the web scraper to collect data"
    echo "  --sanitize                  Clean and prepare scraped data"
    echo "  --remove-category CAT1 CAT2...     Exclude specific categories during scraping"
    echo "  --limit N                          Limit the number of products to scrape"
    echo "  --upsert [INDEX_NAME]       Upload data to Pinecone (optional: specify index name)"
    echo "  --delete-all-vectors [INDEX_NAME]  Delete all vectors from a specific index"
    echo "  --delete-index [INDEX_NAME]        Delete an entire index (WARNING: This will completely remove the index)"
    echo "  --create-index [INDEX_NAME]        Create a new Pinecone index (optional: specify index name)"
    echo "  --describe [INDEX_NAME]            Show statistics about a specific index"
    echo "  --query \"QUERY\" [INDEX_NAME]      Search an index with the given query"

    echo
    echo "Available categories:"
    echo "["shop-mens", "shop-womens", "shop-kids", "shop-shoes"]"

    echo
    echo "Examples:"
    echo "  ./run_scraper.sh --scrape --limit 10                    # Scrape 10 products from each category"
    echo "  ./run_scraper.sh --create-index my-index                # Create a new index named 'my-index'"
    echo "  ./run_scraper.sh --upsert my-index                      # Upload data to 'my-index'"
    echo "  ./run_scraper.sh --query \"red jacket\" my-index          # Search for 'red jacket' in 'my-index'"
    echo "  ./run_scraper.sh --delete-all-vectors my-index          # Delete all vectors from 'my-index'"
    echo "  ./run_scraper.sh --delete-index my-index                # Delete the entire 'my-index'"
    echo
    exit 0
}

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if help is requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    display_help
fi

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
DELETE_ALL_VECTORS=false
DELETE_INDEX=false
CREATE_INDEX=""
DESCRIBE=false
QUERY=""
INDEX_NAME=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            display_help
            ;;
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
            if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
                INDEX_NAME="$2"
                shift
            fi
            shift
            ;;
        --delete-all-vectors)
            DELETE_ALL_VECTORS=true
            if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
                INDEX_NAME="$2"
                shift
            fi
            shift
            ;;
        --delete-index)
            DELETE_INDEX=true
            if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
                INDEX_NAME="$2"
                shift
            fi
            shift
            ;;
        --create-index)
            if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
                CREATE_INDEX="$2"
                shift
            else
                CREATE_INDEX="true"
            fi
            shift
            ;;
        --describe)
            DESCRIBE=true
            if [[ $# -gt 1 && ! "$2" =~ ^-- ]]; then
                INDEX_NAME="$2"
                shift
            fi
            shift
            ;;
        --query)
            QUERY="$2"
            shift 2
            if [[ $# -gt 0 && ! "$1" =~ ^-- ]]; then
                INDEX_NAME="$1"
                shift
            fi
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
            echo "Run './run_scraper.sh --help' for usage information."
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
echo "  DELETE_ALL_VECTORS: $DELETE_ALL_VECTORS"
echo "  DELETE_INDEX: $DELETE_INDEX"
echo "  CREATE_INDEX: $CREATE_INDEX"
echo "  DESCRIBE: $DESCRIBE"
echo "  QUERY: $QUERY"
echo "  INDEX_NAME: $INDEX_NAME"
echo "  LIMIT: $LIMIT"
echo "  REMOVE_CATEGORIES: ${REMOVE_CATEGORIES[*]}"

# Change to the src directory
cd "$SCRIPT_DIR/src"

# Ensure data directory exists
mkdir -p data

# Prepare index name parameter if provided
INDEX_PARAM=${INDEX_NAME:+--index-name "$INDEX_NAME"}

# Handle database management operations first
if [[ -n "$CREATE_INDEX" ]]; then
    echo "Creating new index: ${CREATE_INDEX}"
    if [[ "$CREATE_INDEX" != "true" ]]; then
        python main.py --create-index --index-name "$CREATE_INDEX"
    else
        python main.py --create-index
    fi
fi

if [[ "$DELETE_INDEX" = true ]]; then
    echo "WARNING: This will PERMANENTLY DELETE the entire index${INDEX_NAME:+: $INDEX_NAME}"
    read -p "Are you sure you want to continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Proceeding with index deletion${INDEX_NAME:+: $INDEX_NAME}"
        python main.py --delete-index $INDEX_PARAM
    else
        echo "Index deletion canceled."
    fi
fi

if [[ "$DELETE_ALL_VECTORS" = true ]]; then
    echo "Deleting all vectors from index${INDEX_NAME:+: $INDEX_NAME}"
    python main.py --delete-all-vectors $INDEX_PARAM
fi

if [[ "$DESCRIBE" = true ]]; then
    echo "Describing index${INDEX_NAME:+: $INDEX_NAME}"
    python main.py --describe $INDEX_PARAM
fi

# Run the scraping process
if [[ "$SCRAPE" = true ]]; then
    echo "Running Scraper..."
    CATEGORY_ARGS=""
    if [ ${#REMOVE_CATEGORIES[@]} -gt 0 ]; then
        # Pass all categories in a single --remove-category argument
        CATEGORY_ARGS="--remove-category ${REMOVE_CATEGORIES[*]}"
    fi
    echo "Command: python main.py --scrape --limit $LIMIT $CATEGORY_ARGS"
    python main.py --scrape --limit "$LIMIT" $CATEGORY_ARGS
fi

# Run the sanitization process
if [[ "$SANITIZE" = true ]]; then
    echo "Running Sanitizer..."
    python main.py --sanitize
fi

# Run the upsert process
if [[ "$UPSERT" = true ]]; then
    echo "Upserting Data to Database${INDEX_NAME:+: $INDEX_NAME}"
    python main.py --upsert $INDEX_PARAM
fi

# Run query if provided
if [[ -n "$QUERY" ]]; then
    echo "Querying index${INDEX_NAME:+: $INDEX_NAME} for: $QUERY"
    python main.py --query "$QUERY" $INDEX_PARAM
fi

# Deactivate Conda environment after execution
conda deactivate
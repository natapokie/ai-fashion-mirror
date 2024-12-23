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

If you've installed new packages and want to update the environment.yml file,

```bash
conda env export > environment.yml
```

## Running the Scraper

### Running via Terminal

```bash
python main.py
```

### Running via VSCode Run Button

On VSCode make sure that your Python interpreter is set to the conda environment.
- Open the Command Palette (Ctrl + Shift + P or Cmd + Shift + P on Mac).
- Search for "Python: Select Interpreter" and select it.
- Choose the path corresponding to your Conda environment. The name will include the environment name, e.g., Python 3.12.8 ('scraper').

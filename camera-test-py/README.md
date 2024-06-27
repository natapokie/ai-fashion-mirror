# Overview
Test script for RPi camera module, using PRE API.

We're using the python package [picamera2](https://github.com/raspberrypi/picamera2).

## Testing Locally (on RPi)

## Testing Locally (on PC)

Unable to actually test it locally, but this will allow you to build te code and make sure everything is working.

Ensure that your **WSL** environment is set up, along with **Conda**. WSL allows a Windows computer to run things like Linux. Conda is used as a package/environment manager -- so we can create isolated environments and install whatever packages we need for that environment.

_(To be completely honest, I have no idea why I'm using WSL, maybe it's so that I can use it with conda??)_

### Windows WSL2

Follow the instructions to download [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux).
Once installation is completed, you should be able to enter type `wsl` in any terminal, and it'll open up a bash terminal for you.

```commandline
wsl
(base) username@XXXX:
```

### Mac??

For Mac (TODO: fill this out later)

### Conda Installation

Follow the instructions under [Miniconda on WSL](educe-ubc.github.io/conda.html).

_Make sure you are in your WSL terminal_.

```bash
curl -sL \
  "https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh" > \
  "Miniconda3.sh"
bash Miniconda3.sh  
```

Below are some quick commands...
```bash
# list your conda environments
conda env list

# create a conda env
conda create -n env_name python=3.10

# in order to run stuff, you need to activate your env
conda activate env_name

# delete a conda env
conda env remove --name env_name

# deactive conda env 
conda deactivate
```

### Create Conda Environment

In order to install the picamera2 package, you'll need to run some commands in your WSL terminal first.

```bash
# update package list
sudo apt update

# install GCC, essential build tools and development headers:
sudo apt install build-essential
sudo apt install libcap-dev
```


Now you're ready to actually create the environment. All the specifications to create the conda environment can be found in the `environment.yml`.

```bash
# command is used to create a Conda environment based on the specifications provided in an environment.yml file.
conda env create -f environment.yml
conda activate camera-test-py
```

**Steps below in case you run into errors installing? not sure if this actually works?**

Since picamera2 also depends on [libcamera](https://github.com/raspberrypi/libcamera), you'll need to follow the steps and install that too.

```bash
sudo apt install -y python-pip git python3-jinja2
```

```bash
sudo apt install -y libboost-dev
sudo apt install -y libgnutls28-dev openssl libtiff-dev pybind11-dev
sudo apt install -y qtbase5-dev libqt5core5a libqt5widgets
sudo apt install -y meson cmake
sudo apt install -y python3-yaml python3-ply
sudo apt install -y libglib2.0-dev libgstreamer-plugins-base1.0-dev
```

```bash
git clone https://github.com/raspberrypi/libcamera.git
cd libcamera
meson setup build --buildtype=release -Dpipelines=rpi/vc4,rpi/pisp -Dipas=rpi/vc4,rpi/pisp -Dv4l2=true -Dgstreamer=enabled -Dtest=false -Dlc-compliance=disabled -Dcam=disabled -Dqcam=disabled -Ddocumentation=disabled -Dpycamera=enabled

# if the meson step fails, 
# meson.build:274:7: ERROR: python3 is missing modules: jinja2, ply, jinja2, yaml
# install the modules respectively
pip install jinja2
pip install ply
pip install pyyaml

ninja -C build install
```

### Running the Code

```bash
cd src
python app.py
```


#!/bin/bash
# Setup script for Conda environment

# Install Miniconda
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh

# Initialize conda
~/miniconda3/bin/conda init bash
source ~/.bashrc

# Create conda environment from environment.yml
~/miniconda3/bin/conda env create -f environment.yml

# Activate environment
source ~/miniconda3/bin/activate payroll-env

echo "Conda environment setup completed successfully!"

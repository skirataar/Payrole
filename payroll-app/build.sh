#!/bin/bash
# Build script for Render.com deployment

# Install system dependencies if apt-packages.txt exists
if [ -f "apt-packages.txt" ]; then
  echo "Installing system dependencies..."
  apt-get update -y
  apt-get install -y $(cat apt-packages.txt)
fi

# Install Python dependencies
pip install --upgrade pip
pip install wheel
pip install -r requirements.txt

# Build the React frontend
npm install
npm run build

# Print success message
echo "Build completed successfully!"

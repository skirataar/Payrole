#!/bin/bash
# Build script for Vercel deployment

# Build the React frontend
npm run build:vite

# Copy the excel_processor.py file to the api directory if it exists
if [ -f "backend/excel_processor.py" ]; then
  cp backend/excel_processor.py api/
fi

# Print success message
echo "Build completed successfully!"

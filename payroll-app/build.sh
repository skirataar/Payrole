#!/bin/bash
# Build script for Vercel deployment (frontend only)

# Build the React frontend
npm run build:vite

# Print success message
echo "Frontend build completed successfully!"

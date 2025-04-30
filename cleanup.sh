#!/bin/bash
# Script to clean up unnecessary files before production deployment

# Set the script to exit on error
set -e

echo "Starting cleanup process..."

# Remove Python cache files
echo "Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
find . -type f -name "*.pyo" -delete
find . -type f -name "*.pyd" -delete

# Remove temporary files
echo "Removing temporary files..."
find . -type f -name "*~" -delete
find . -type f -name "*.bak" -delete
find . -type f -name "*.swp" -delete
find . -type f -name "*.swo" -delete

# Remove node_modules (if you want to rebuild from scratch)
# echo "Removing node_modules..."
# rm -rf node_modules

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf dist
rm -rf build
rm -rf .pytest_cache
rm -rf .coverage
rm -rf htmlcov
rm -rf .mypy_cache

# Remove logs
echo "Removing log files..."
rm -rf logs/*.log

# Remove database files (be careful with this in production)
# echo "Removing database files..."
# rm -rf *.db
# rm -rf *.sqlite3

# Remove environment-specific files
echo "Removing environment-specific files..."
rm -f .env.local
rm -f .env.development.local
rm -f .env.test.local
rm -f .env.production.local

echo "Cleanup completed successfully!"

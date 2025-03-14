#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create necessary directories
echo "Setting up Netlify functions..."
mkdir -p netlify/functions

# Copy files if needed
echo "Build completed successfully!" 
#!/bin/bash
# Start Sentinel Backend API Server

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Change to parent directory to run as module
cd ..

# Start the server
python -m backend.main

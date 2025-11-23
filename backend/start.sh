#!/bin/bash
# Start Sentinel Backend API Server

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Change to parent directory to run as module
cd ..

# Start the server with uvicorn
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

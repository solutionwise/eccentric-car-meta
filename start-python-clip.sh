#!/bin/bash

# Start Python CLIP service
echo "🚀 Starting Python CLIP service..."

# Navigate to the python-clip-service directory
cd python-clip-service

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Start the Flask application
echo "🔄 Starting Flask application..."
python3 app.py

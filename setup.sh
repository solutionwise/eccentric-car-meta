#!/bin/bash

echo "🚗 Setting up Eccentric Car Finder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env and add your HUGGINGFACE_API_KEY"
fi

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

# Start Weaviate
echo "🐳 Starting Weaviate..."
docker-compose up -d

# Wait for Weaviate to be ready
echo "⏳ Waiting for Weaviate to be ready..."
sleep 10

# Check if Weaviate is running
if curl -s http://localhost:8080/v1/meta > /dev/null; then
    echo "✅ Weaviate is running"
else
    echo "❌ Weaviate failed to start. Please check Docker logs."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your HUGGINGFACE_API_KEY"
echo "2. Run 'npm run dev' to start the development servers"
echo "3. Visit http://localhost:3000 to use the application"
echo "4. Visit http://localhost:3000/admin to upload images"
echo ""
echo "API endpoints:"
echo "- Backend: http://localhost:3001"
echo "- Weaviate: http://localhost:8080"
echo "- Frontend: http://localhost:3000"

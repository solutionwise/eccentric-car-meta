# Getting Started with Eccentric Car Meta

This guide will help you get the automotive text-to-image search system up and running quickly.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/get-started)
- **Hugging Face API Key** - [Get one here](https://huggingface.co/settings/tokens)

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
cd eccentric-car-meta

# Run the setup script
./setup.sh
```

### 2. Configure Environment

Edit the backend environment file:

```bash
cd backend
cp env.example .env
```

Add your Hugging Face API key to `backend/.env`:

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

### 3. Start the System

```bash
# Start Weaviate (vector database)
npm run docker:up

# Start both backend and frontend
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Weaviate**: http://localhost:8080

### 4. Test the System

```bash
# Run system tests
npm test
```

### 5. Add Sample Data (Optional)

```bash
# Create sample automotive images
npm run sample-data
```

## Usage

### Search Interface

1. Visit http://localhost:3000
2. Enter natural language queries like:
   - "red sports car"
   - "luxury black sedan"
   - "family SUV with sunroof"
   - "BMW convertible"

### Admin Panel

1. Visit http://localhost:3000/admin
2. Upload images via drag-and-drop
3. Add tags during upload
4. Manage existing images

## API Endpoints

### Search
- `POST /api/search` - Search images
- `GET /api/search/suggestions` - Get suggestions
- `GET /api/search/analytics` - Get analytics

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images

### Images
- `GET /api/images` - List images
- `GET /api/images/:id` - Get image details
- `PUT /api/images/:id/tags` - Update tags
- `DELETE /api/images/:id` - Delete image

## Troubleshooting

### Backend Won't Start

1. Check if port 3001 is available
2. Verify your `.env` file has the correct API key
3. Make sure Weaviate is running: `docker-compose ps`

### Weaviate Issues

1. Check Docker is running: `docker ps`
2. Restart Weaviate: `docker-compose restart`
3. Check logs: `docker-compose logs weaviate`

### Frontend Issues

1. Check if port 3000 is available
2. Verify backend is running on port 3001
3. Check browser console for errors

### Search Not Working

1. Verify Hugging Face API key is valid
2. Check if images are uploaded and indexed
3. Run system tests: `npm test`

## Development

### Project Structure

```
eccentric-car-meta/
├── backend/           # Node.js API server
├── frontend/          # Nuxt.js web interface
├── scripts/           # Utility scripts
├── docker-compose.yml # Weaviate setup
└── README.md         # Full documentation
```

### Adding Features

1. **Backend**: Add routes in `backend/src/routes/`
2. **Frontend**: Add pages in `frontend/pages/`
3. **Components**: Add reusable components in `frontend/components/`

### Environment Variables

**Backend (.env)**
```env
PORT=3001
WEAVIATE_URL=http://localhost:8080
HUGGINGFACE_API_KEY=your_key_here
UPLOAD_DIR=./uploads
DATABASE_PATH=./database.sqlite
```

## Performance

- **Search Response**: < 2 seconds
- **Concurrent Users**: 10+ users
- **Image Limit**: 100 images (MVP)
- **File Size**: 10MB max per image

## Next Steps

1. **Upload Images**: Use the admin panel to upload automotive images
2. **Test Search**: Try various natural language queries
3. **Customize**: Modify tags, styling, or add new features
4. **Deploy**: Follow deployment guide for production setup

## Support

- Check the [README.md](README.md) for detailed documentation
- Review API endpoints and examples
- Run `npm test` to verify system health
- Check logs for error details

---

**Happy searching! 🚗🔍**

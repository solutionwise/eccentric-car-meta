# Eccentric Car Finder - Automotive Text-to-Image Search

An AI-powered automotive image search system that allows users to find car images using natural language queries. Built with Nuxt.js, Node.js, and OpenAI CLIP.

## Features

- 🔍 **Natural Language Search**: Search for cars using descriptive text like "red sports car with sunroof"
- 🖼️ **Image Upload & Management**: Upload and tag automotive images through an admin interface
- 🤖 **AI-Powered**: Uses OpenAI CLIP model for semantic image understanding
- 📊 **Vector Search**: Leverages Weaviate for fast similarity search
- 🏷️ **Smart Tagging**: Automatic and manual tagging system
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend
- **Nuxt.js 3** - Vue.js framework
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible components
- **Heroicons** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **SQLite** - Metadata storage
- **Weaviate** - Vector database
- **Transformers.js** - CLIP image embeddings (local)
- **Sharp** - Image processing

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Hugging Face API key

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd eccentric-car-meta
   npm install
   ```

2. **Start Weaviate**
   ```bash
   npm run docker:up
   ```

3. **Setup backend**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env and add your HUGGINGFACE_API_KEY
   npm install
   ```

4. **Setup frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start development servers**
   ```bash
   # From project root
   npm run dev
   ```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000
- Weaviate on http://localhost:8080

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
2. Upload images via drag-and-drop or file picker
3. Add tags during upload
4. Manage existing images

## API Endpoints

### Search
- `POST /api/search` - Perform image search
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/analytics` - Get search statistics

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `GET /api/upload/stats` - Get upload statistics

### Images
- `GET /api/images` - List all images
- `GET /api/images/:id` - Get image details
- `PUT /api/images/:id/tags` - Update image tags
- `DELETE /api/images/:id` - Delete image

## Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3001
WEAVIATE_URL=http://localhost:8080
HUGGINGFACE_API_KEY=your_api_key_here
UPLOAD_DIR=./uploads
DATABASE_PATH=./database.sqlite
```

**Frontend (nuxt.config.ts)**
```typescript
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:3001/api'
  }
}
```

## Project Structure

```
eccentric-car-meta/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express server
│   │   ├── models/
│   │   │   └── Image.js        # SQLite model
│   │   ├── routes/
│   │   │   ├── search.js       # Search endpoints
│   │   │   ├── upload.js       # Upload endpoints
│   │   │   └── images.js       # Image management
│   │   └── services/
│   │       ├── clipService.js  # CLIP integration
│   │       ├── weaviateService.js # Vector DB
│   │       └── imageService.js # Image processing
│   └── package.json
├── frontend/
│   ├── pages/
│   │   ├── index.vue           # Search interface
│   │   └── admin.vue           # Admin panel
│   ├── components/
│   │   └── ImageModal.vue      # Image viewer
│   └── nuxt.config.ts
├── docker-compose.yml          # Weaviate setup
└── README.md
```

## Development

### Adding New Features

1. **Backend**: Add routes in `src/routes/`, services in `src/services/`
2. **Frontend**: Add pages in `pages/`, components in `components/`
3. **Database**: Modify `src/models/Image.js` for schema changes

### Testing

```bash
# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## Deployment

### Production Setup

1. **Environment**: Set production environment variables
2. **Database**: Use PostgreSQL instead of SQLite
3. **Storage**: Use cloud storage (AWS S3, etc.)
4. **Scaling**: Use PM2 for Node.js process management

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## Performance

- **Search Response**: < 2 seconds
- **Concurrent Users**: 10+ users
- **Image Limit**: 100 images (MVP)
- **File Size**: 10MB max per image

## Limitations (MVP)

- No user authentication
- Local file storage only
- No image-to-image search
- Limited to 100 images
- No advanced filtering

## Future Enhancements

- User authentication & authorization
- Cloud storage integration
- Advanced filtering options
- Image-to-image search
- Batch processing
- Analytics dashboard
- API rate limiting
- Caching layer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

Built with ❤️ for automotive enthusiasts and AI researchers.

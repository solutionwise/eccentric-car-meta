#Architecture

##Frontend (Next.js)
pages/
├── index.js # Search interface
├── admin.js # Upload and tag images
└── api/
├── search.js # Search endpoint
├── upload.js # Image upload
└── images.js # Image metadata

##Backend (Node.js)
src/
├── app.js # Express server
├── routes/
│ ├── search.js # Search logic
│ ├── upload.js # Image processing
│ └── images.js # Image metadata
├── services/
│ ├── clipService.js # CLIP embedding generation
│ ├── weaviateService.js # Vector operations
│ └── imageService.js # Image processing
└── models/
└── Image.js # Image metadata model
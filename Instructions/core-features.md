#Core Features

1. Image Upload & Processing
• Upload 100 automotive images via admin interface
• Automatic metadata extraction
• Generate CLIP embeddings for each image
• Store embeddings in Weaviate with metadata

2. Text-to-Image Search
• Simple search input field
• Natural language queries (e.g., “red SUV with sunroof”)
• Return top 10 matching images
• Display results with similarity scores
• Click to view full-size images

3. Tagging System
• Automatic and Manual tag assignment during upload
• Predefined tag categories:
– Color: red, blue, white, black, silver, etc.
– Type: sedan, SUV, truck, convertible, hatchback
– Features: sunroof, leather, alloy wheels, spoiler
– Brand: Toyota, Honda, BMW, Ford, etc.
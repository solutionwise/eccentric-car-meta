const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const weaviateService = require('../services/weaviateService');

// Get all images with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, tags } = req.query;
    const offset = (page - 1) * limit;

    let images;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      images = await Image.searchByTags(tagArray, parseInt(limit));
    } else {
      images = await Image.findAll(parseInt(limit), offset);
    }

    // Get total count for pagination
    const totalImages = await Image.findAll(10000, 0); // Get all for count
    const totalPages = Math.ceil(totalImages.length / limit);

    res.json({
      images,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalImages: totalImages.length,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ 
      error: 'Failed to get images',
      message: error.message 
    });
  }
});

// Get single image by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    res.json({ image });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ 
      error: 'Failed to get image',
      message: error.message 
    });
  }
});


// Update image metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.weaviate_id;

    // Get current image
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    // Update in database
    const result = await Image.update(id, updateData);

    if (result.changes === 0) {
      return res.status(400).json({ 
        error: 'No changes made' 
      });
    }

    // Get updated image
    const updatedImage = await Image.findById(id);

    res.json({
      success: true,
      message: 'Image updated successfully',
      image: updatedImage
    });

  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ 
      error: 'Failed to update image',
      message: error.message 
    });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image from database
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    // Delete from Weaviate
    if (image.weaviate_id) {
      await weaviateService.deleteImage(image.weaviate_id);
    }

    // Delete file from filesystem
    const fs = require('fs').promises;
    try {
      await fs.unlink(image.file_path);
    } catch (fileError) {
      console.warn('File not found on filesystem:', image.file_path);
    }

    // Delete from database
    await Image.delete(id);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message 
    });
  }
});

// Get image file (serve the actual image)
router.get('/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    // Check if file exists
    const fs = require('fs').promises;
    try {
      await fs.access(image.file_path);
    } catch {
      return res.status(404).json({ 
        error: 'Image file not found on disk' 
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', image.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${image.original_name}"`);
    
    // Send file
    res.sendFile(path.resolve(image.file_path));

  } catch (error) {
    console.error('Get image file error:', error);
    res.status(500).json({ 
      error: 'Failed to get image file',
      message: error.message 
    });
  }
});

// Get image thumbnail (placeholder for future implementation)
router.get('/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ 
        error: 'Image not found' 
      });
    }

    // For now, just serve the original image
    // In a production system, you'd generate and cache thumbnails
    res.redirect(`/api/images/${id}/file`);

  } catch (error) {
    console.error('Get thumbnail error:', error);
    res.status(500).json({ 
      error: 'Failed to get thumbnail',
      message: error.message 
    });
  }
});

// Get all unique tags
router.get('/tags/all', async (req, res) => {
  try {
    const images = await Image.findAll(10000, 0); // Get all images
    const allTags = new Set();

    images.forEach(image => {
      if (image.tags && Array.isArray(image.tags)) {
        image.tags.forEach(tag => allTags.add(tag));
      }
    });

    const sortedTags = Array.from(allTags).sort();

    res.json({
      tags: sortedTags,
      count: sortedTags.length
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ 
      error: 'Failed to get tags',
      message: error.message 
    });
  }
});

// Get predefined tag categories
router.get('/tags/predefined', async (req, res) => {
  try {
    const predefinedTags = {
      colors: [
        'red', 'blue', 'white', 'black', 'silver', 'gray', 'grey', 'green', 
        'yellow', 'orange', 'purple', 'brown', 'gold', 'bronze', 'maroon',
        'navy', 'beige', 'cream', 'pink', 'turquoise'
      ],
      types: [
        'sedan', 'suv', 'truck', 'convertible', 'hatchback', 'coupe', 'wagon',
        'minivan', 'pickup', 'crossover', 'sports car', 'luxury car', 'supercar',
        'muscle car', 'electric car', 'hybrid', 'roadster', 'cabriolet'
      ],
      features: [
        'sunroof', 'leather', 'alloy wheels', 'spoiler', 'navigation', 'bluetooth',
        'automatic', 'manual', 'all-wheel drive', 'four-wheel drive', 'turbo',
        'v8', 'v6', 'diesel', 'electric', 'hybrid', 'premium sound', 'heated seats',
        'cooled seats', 'backup camera', 'parking sensors', 'adaptive cruise',
        'lane assist', 'blind spot monitoring', 'premium interior', 'sport package'
      ],
      brands: [
        'toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes',
        'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus',
        'acura', 'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge',
        'chrysler', 'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley',
        'rolls royce', 'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo',
        'saab', 'mini', 'smart', 'tesla', 'genesis', 'buick', 'gmc'
      ],
      styles: [
        'sporty', 'luxury', 'family', 'fast', 'economical', 'premium', 'classic',
        'modern', 'vintage', 'retro', 'futuristic', 'elegant', 'aggressive'
      ]
    };

    res.json({
      categories: predefinedTags,
      totalTags: Object.values(predefinedTags).flat().length
    });

  } catch (error) {
    console.error('Get predefined tags error:', error);
    res.status(500).json({ 
      error: 'Failed to get predefined tags',
      message: error.message 
    });
  }
});

// Search images by tags
router.get('/search/tags', async (req, res) => {
  try {
    const { tags, limit = 20 } = req.query;
    
    if (!tags) {
      return res.status(400).json({ 
        error: 'Tags parameter is required' 
      });
    }

    const tagArray = Array.isArray(tags) ? tags : [tags];
    const images = await Image.searchByTags(tagArray, parseInt(limit));

    res.json({
      images,
      searchTags: tagArray,
      count: images.length
    });

  } catch (error) {
    console.error('Search by tags error:', error);
    res.status(500).json({ 
      error: 'Failed to search by tags',
      message: error.message 
    });
  }
});

// Get image statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const images = await Image.findAll(10000, 0);
    const weaviateStats = await weaviateService.getStats();

    // Calculate statistics
    const stats = {
      totalImages: images.length,
      weaviateImages: weaviateStats,
      totalFileSize: images.reduce((sum, img) => sum + (img.file_size || 0), 0),
      averageFileSize: 0,
      tagsCount: 0,
      formats: {},
      sizes: {
        small: 0,    // < 500KB
        medium: 0,   // 500KB - 2MB
        large: 0     // > 2MB
      }
    };

    // Calculate averages and distributions
    if (images.length > 0) {
      stats.averageFileSize = Math.round(stats.totalFileSize / images.length);
      
      // Count formats
      images.forEach(img => {
        const format = img.mime_type?.split('/')[1] || 'unknown';
        stats.formats[format] = (stats.formats[format] || 0) + 1;
      });

      // Count file sizes
      images.forEach(img => {
        const size = img.file_size || 0;
        if (size < 500 * 1024) stats.sizes.small++;
        else if (size < 2 * 1024 * 1024) stats.sizes.medium++;
        else stats.sizes.large++;
      });

      // Count unique tags
      const allTags = new Set();
      images.forEach(img => {
        if (img.tags && Array.isArray(img.tags)) {
          img.tags.forEach(tag => allTags.add(tag));
        }
      });
      stats.tagsCount = allTags.size;
    }

    res.json(stats);

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error.message 
    });
  }
});

// Add tag to an image
router.post('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;

    if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Tag is required and must be a non-empty string' 
      });
    }

    const trimmedTag = tag.trim().toLowerCase();
    
    // Get the image
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if tag already exists
    const currentTags = image.tags || [];
    if (currentTags.includes(trimmedTag)) {
      return res.status(400).json({ 
        error: 'Tag already exists for this image' 
      });
    }

    // Add the tag
    const updatedTags = [...currentTags, trimmedTag];
    await Image.update(id, { tags: updatedTags });

    // Update Weaviate if the image has a weaviate_id
    if (image.weaviate_id) {
      try {
        await weaviateService.updateImageTags(image.weaviate_id, updatedTags);
      } catch (weaviateError) {
        console.error('Error updating Weaviate tags:', weaviateError);
        // Don't fail the request if Weaviate update fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Tag added successfully',
      tags: updatedTags 
    });

  } catch (error) {
    console.error('Add tag error:', error);
    res.status(500).json({ 
      error: 'Failed to add tag',
      message: error.message 
    });
  }
});

// Remove tag from an image
router.delete('/:id/tags/:tag', async (req, res) => {
  try {
    const { id, tag } = req.params;

    if (!tag || tag.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Tag is required' 
      });
    }

    const trimmedTag = tag.trim().toLowerCase();
    
    // Get the image
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if tag exists
    const currentTags = image.tags || [];
    if (!currentTags.includes(trimmedTag)) {
      return res.status(400).json({ 
        error: 'Tag does not exist for this image' 
      });
    }

    // Remove the tag
    const updatedTags = currentTags.filter(t => t !== trimmedTag);
    await Image.update(id, { tags: updatedTags });

    // Update Weaviate if the image has a weaviate_id
    if (image.weaviate_id) {
      try {
        await weaviateService.updateImageTags(image.weaviate_id, updatedTags);
      } catch (weaviateError) {
        console.error('Error updating Weaviate tags:', weaviateError);
        // Don't fail the request if Weaviate update fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Tag removed successfully',
      tags: updatedTags 
    });

  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ 
      error: 'Failed to remove tag',
      message: error.message 
    });
  }
});

// Update all tags for an image
router.put('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ 
        error: 'Tags must be an array' 
      });
    }

    // Validate and clean tags
    const cleanedTags = tags
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
    
    // Get the image
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update the tags
    await Image.update(id, { tags: cleanedTags });

    // Update Weaviate if the image has a weaviate_id
    if (image.weaviate_id) {
      try {
        await weaviateService.updateImageTags(image.weaviate_id, cleanedTags);
      } catch (weaviateError) {
        console.error('Error updating Weaviate tags:', weaviateError);
        // Don't fail the request if Weaviate update fails
      }
    }

    res.json({ 
      success: true, 
      message: 'Tags updated successfully',
      tags: cleanedTags 
    });

  } catch (error) {
    console.error('Update tags error:', error);
    res.status(500).json({ 
      error: 'Failed to update tags',
      message: error.message 
    });
  }
});

module.exports = router;

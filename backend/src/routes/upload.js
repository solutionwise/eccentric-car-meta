const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const imageService = require('../services/imageService');
const clipService = require('../services/clipService');
const weaviateService = require('../services/weaviateService');
const Image = require('../models/Image');
const fs = require('fs').promises;
const fsSync = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure temp directory exists
    const tempDir = 'temp/';
    if (!fsSync.existsSync(tempDir)) {
      fsSync.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const validation = imageService.validateFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
    }
  }
});

// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    await fs.access('temp/');
  } catch {
    await fs.mkdir('temp/', { recursive: true });
  }
};

// Upload single image
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    await ensureTempDir();
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided' 
      });
    }


    // Save file to permanent location
    const fileData = await imageService.saveFile(req.file);
    
    // Generate auto tags
    const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
    
    // Combine auto tags with manual tags
    const manualTags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const allTags = [...new Set([...autoTags, ...manualTags])];

    // Generate CLIP embedding
    const imageBuffer = await fs.readFile(fileData.filePath);
    const embedding = await clipService.generateImageEmbedding(imageBuffer);

    // Store in Weaviate
    const weaviateId = await weaviateService.addImage({
      ...fileData,
      tags: allTags
    }, embedding);

    // Store in SQLite database
    const dbImage = await Image.create({
      ...fileData,
      tags: allTags,
      weaviateId
    });

    res.json({
      success: true,
      image: {
        id: dbImage.id,
        filename: fileData.filename,
        originalName: fileData.originalName,
        filePath: fileData.filePath,
        tags: allTags,
        metadata: {
          fileSize: fileData.fileSize,
          mimeType: fileData.mimeType,
          width: fileData.width,
          height: fileData.height
        },
        weaviateId
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    await ensureTempDir();
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No image files provided' 
      });
    }


    const results = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      try {
        const file = req.files[i];
        
        // Save file to permanent location
        const fileData = await imageService.saveFile(file);
        
        // Generate auto tags
        const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
        
        // Get manual tags for this specific file
        const manualTags = req.body[`tags_${i}`] ? JSON.parse(req.body[`tags_${i}`]) : [];
        const allTags = [...new Set([...autoTags, ...manualTags])];

        // Generate CLIP embedding
        const imageBuffer = await fs.readFile(fileData.filePath);
        const embedding = await clipService.generateImageEmbedding(imageBuffer);

        // Store in Weaviate
        const weaviateId = await weaviateService.addImage({
          ...fileData,
          tags: allTags
        }, embedding);

        // Store in SQLite database
        const dbImage = await Image.create({
          ...fileData,
          tags: allTags,
          weaviateId
        });

        results.push({
          id: dbImage.id,
          filename: fileData.filename,
          originalName: fileData.originalName,
          tags: allTags,
          weaviateId
        });

      } catch (error) {
        console.error(`Error processing file ${i}:`, error);
        errors.push({
          index: i,
          filename: req.files[i].originalname,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ 
      error: 'Bulk upload failed',
      message: error.message 
    });
  }
});

// Get upload progress (for future implementation)
router.get('/progress/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    // This would be implemented with a proper job queue system
    // For now, return a simple response
    res.json({
      uploadId,
      status: 'completed',
      progress: 100
    });
  } catch (error) {
    console.error('Progress check error:', error);
    res.status(500).json({ 
      error: 'Failed to get upload progress' 
    });
  }
});

// Get upload statistics
router.get('/stats', async (req, res) => {
  try {
    const fileStats = await imageService.getFileStats();
    const weaviateStats = await weaviateService.getStats();
    const dbImages = await Image.findAll(1000, 0); // Get all images

    res.json({
      totalFiles: fileStats.totalFiles,
      totalSizeMB: fileStats.totalSizeMB,
      weaviateImages: weaviateStats,
      databaseImages: dbImages.length,
      averageFileSize: fileStats.totalFiles > 0 ? 
        (fileStats.totalSize / fileStats.totalFiles / 1024).toFixed(2) + ' KB' : '0 KB'
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get upload stats' 
    });
  }
});

// Delete uploaded image
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
    await imageService.deleteFile(image.file_path);

    // Delete from database
    await Image.delete(id);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message 
    });
  }
});

// Root upload route - handles both single and multiple uploads
router.post('/', upload.any(), async (req, res) => {
  try {
    await ensureTempDir();
    
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        error: 'No files provided' 
      });
    }

    // If single file, use single upload logic
    if (files.length === 1) {
      const file = files[0];
      
      // Save file to permanent location
      const fileData = await imageService.saveFile(file);
      
      // Generate auto tags
      const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
      
      // Combine auto tags with manual tags
      const manualTags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const allTags = [...new Set([...autoTags, ...manualTags])];

      // Generate CLIP embedding
      const imageBuffer = await fs.readFile(fileData.filePath);
      const embedding = await clipService.generateImageEmbedding(imageBuffer);

      // Store in Weaviate
      const weaviateId = await weaviateService.addImage({
        ...fileData,
        tags: allTags
      }, embedding);

      // Store in SQLite database
      const dbImage = await Image.create({
        ...fileData,
        tags: allTags,
        weaviateId
      });

      return res.json({
        success: true,
        message: 'Image uploaded successfully',
        image: dbImage
      });
    } else {
      // Multiple files - use multiple upload logic
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          // Save file to permanent location
          const fileData = await imageService.saveFile(file);
          
          // Generate auto tags
          const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
          
          // Combine auto tags with manual tags
          const manualTags = req.body.tags ? JSON.parse(req.body.tags) : [];
          const allTags = [...new Set([...autoTags, ...manualTags])];

          // Generate CLIP embedding
          const imageBuffer = await fs.readFile(fileData.filePath);
          const embedding = await clipService.generateImageEmbedding(imageBuffer);

          // Store in Weaviate
          const weaviateId = await weaviateService.addImage({
            ...fileData,
            tags: allTags
          }, embedding);

          // Store in SQLite database
          const dbImage = await Image.create({
            ...fileData,
            tags: allTags,
            weaviateId
          });

          results.push({
            success: true,
            filename: file.originalname,
            image: dbImage
          });
          successCount++;
        } catch (error) {
          console.error(`Error processing ${file.originalname}:`, error);
          results.push({
            success: false,
            filename: file.originalname,
            error: error.message
          });
          errorCount++;
        }
      }

      return res.json({
        success: true,
        message: `Uploaded ${successCount} images successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        uploaded: successCount,
        failed: errorCount,
        results
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

module.exports = router;

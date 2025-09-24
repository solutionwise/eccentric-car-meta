const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const imageService = require('../services/imageService');
const clipService = require('../services/clipService');
const weaviateService = require('../services/weaviateService');
const carDetectionService = require('../services/carDetectionService');
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
    files: 100 // Max 100 files at once
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

// Process car detection and cropping for an image
const processCarDetection = async (filePath) => {
  try {
    console.log('🚗 Starting car detection and cropping process...');
    
    // Read the original image
    const originalImageBuffer = await fs.readFile(filePath);
    
    // Detect cars in the image
    const carRegion = await carDetectionService.getBestCarRegion(originalImageBuffer);
    
    if (carRegion) {
      console.log(`✅ Car detected with confidence: ${carRegion.score.toFixed(3)}`);
      
      // Create a focused/cropped image of the car
      const croppedImageBuffer = await carDetectionService.createFocusedImage(originalImageBuffer, carRegion);
      
      // Save the cropped image, replacing the original
      await fs.writeFile(filePath, croppedImageBuffer);
      
      console.log('🎯 Image cropped to focus on detected car');
      
      return {
        carDetected: true,
        confidence: carRegion.score,
        label: carRegion.label,
        originalSize: originalImageBuffer.length,
        croppedSize: croppedImageBuffer.length
      };
    } else {
      console.log('⚠️ No car detected, keeping original image');
      return {
        carDetected: false,
        originalSize: originalImageBuffer.length
      };
    }
  } catch (error) {
    console.error('❌ Error in car detection process:', error);
    return {
      carDetected: false,
      error: error.message
    };
  }
};

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
      
      // 🚗 CAR DETECTION AND CROPPING - Process before auto-tagging
      const carDetectionResult = await processCarDetection(fileData.filePath);
      console.log('Car detection result:', carDetectionResult);
      
      // Generate auto tags (now working with potentially cropped image)
      const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
      
      // Combine auto tags with manual tags
      const manualTags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const allTags = [...new Set([...autoTags, ...manualTags])];

      // Generate enhanced CLIP embedding with tag information, color histogram, and car detection
      const imageBuffer = await fs.readFile(fileData.filePath);
      const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags, true, true); // useColorHistogram=true, useCarDetection=true
      
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
        image: dbImage,
        carDetection: carDetectionResult
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
          
          // 🚗 CAR DETECTION AND CROPPING - Process before auto-tagging
          const carDetectionResult = await processCarDetection(fileData.filePath);
          console.log(`Car detection result for ${file.originalname}:`, carDetectionResult);
          
          // Generate auto tags (now working with potentially cropped image)
          const autoTags = await imageService.generateAutoTags(fileData.filePath, fileData.originalName);
          
          // Combine auto tags with manual tags
          const manualTags = req.body.tags ? JSON.parse(req.body.tags) : [];
          const allTags = [...new Set([...autoTags, ...manualTags])];

          // Generate enhanced CLIP embedding with tag information, color histogram, and car detection
          const imageBuffer = await fs.readFile(fileData.filePath);
          const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags, true, true); // useColorHistogram=true, useCarDetection=true

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
            image: dbImage,
            carDetection: carDetectionResult
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

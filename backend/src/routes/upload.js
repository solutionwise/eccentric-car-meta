const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const imageService = require('../services/imageService');
const clipService = require('../services/clipService');
const weaviateService = require('../services/weaviateService');
const uploadJobService = require('../services/uploadJobService');
const Image = require('../models/Image');
const fs = require('fs').promises;
const fsSync = require('fs');
const csv = require('csv-parser');
const https = require('https');
const http = require('http');
const { URL } = require('url');

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
    // Allow CSV files for CSV import endpoint
    if (req.path === '/csv-import' && file.mimetype === 'text/csv') {
      cb(null, true);
      return;
    }
    
    // For other endpoints, validate as image
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

// Helper function to check if a string is a valid URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper function to get error descriptions
const getErrorDescription = (reason) => {
  const descriptions = {
    'FILE_NOT_FOUND': 'Local file path does not exist',
    'DUPLICATE': 'Image already exists in database',
    'DOWNLOAD_TIMEOUT': 'Image download timed out (30 seconds)',
    'DOWNLOAD_FAILED': 'Failed to download image from URL',
    'INVALID_CONTENT_TYPE': 'URL does not point to a valid image file',
    'UNSUPPORTED_FORMAT': 'Image format is not supported',
    'FILE_TOO_LARGE': 'Image file exceeds size limit (10MB)',
    'INVALID_FILE_TYPE': 'File type is not allowed',
    'VECTOR_DB_ERROR': 'Failed to store in vector database (Weaviate)',
    'DATABASE_ERROR': 'Failed to store in SQLite database',
    'UNKNOWN_ERROR': 'An unexpected error occurred'
  };
  return descriptions[reason] || 'Unknown error type';
};

// Helper function to download image from URL
const downloadImageFromUrl = async (imageUrl, tempDir) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(imageUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      
      // Generate a unique filename for the downloaded image
      const filename = `downloaded_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
      const filePath = path.join(tempDir, filename);
      
      const file = fsSync.createWriteStream(filePath);
      
      const request = protocol.get(imageUrl, (response) => {
        // Check if response is successful
        if (response.statusCode !== 200) {
          file.close();
          fsSync.unlinkSync(filePath); // Delete the file on error
          reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
          return;
        }
        
        // Check content type
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          file.close();
          fsSync.unlinkSync(filePath); // Delete the file on error
          reject(new Error(`Invalid content type: ${contentType}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve({
            path: filePath,
            originalname: path.basename(url.pathname) || filename,
            mimetype: contentType,
            size: fsSync.statSync(filePath).size
          });
        });
        
        file.on('error', (err) => {
          file.close();
          fsSync.unlinkSync(filePath); // Delete the file on error
          reject(err);
        });
      });
      
      request.on('error', (err) => {
        file.close();
        if (fsSync.existsSync(filePath)) {
          fsSync.unlinkSync(filePath); // Delete the file on error
        }
        reject(err);
      });
      
      // Set timeout for the request
      request.setTimeout(30000, () => {
        request.destroy();
        file.close();
        if (fsSync.existsSync(filePath)) {
          fsSync.unlinkSync(filePath); // Delete the file on error
        }
        reject(new Error('Download timeout'));
      });
      
    } catch (error) {
      reject(error);
    }
  });
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

    // Generate enhanced CLIP embedding with tag information
    const imageBuffer = await fs.readFile(fileData.filePath);
    const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags);

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
router.post('/multiple', upload.array('images', 100), async (req, res) => {
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

        // Generate enhanced CLIP embedding with tag information
        const imageBuffer = await fs.readFile(fileData.filePath);
        const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags);

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

// Get upload progress
router.get('/progress/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = uploadJobService.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        error: 'Upload job not found' 
      });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      results: job.results,
      errors: job.errors,
      skipped: job.skipped,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      cancelled: job.cancelled,
      cancellationReason: job.cancellationReason,
      metadata: job.metadata
    });
  } catch (error) {
    console.error('Progress check error:', error);
    res.status(500).json({ 
      error: 'Failed to get upload progress' 
    });
  }
});

// Cancel upload job
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    
    const job = uploadJobService.cancelJob(jobId, reason || 'User requested cancellation');
    
    res.json({
      success: true,
      message: 'Upload job cancelled successfully',
      job: {
        id: job.id,
        status: job.status,
        cancelled: job.cancelled,
        cancellationReason: job.cancellationReason,
        completedAt: job.completedAt
      }
    });
  } catch (error) {
    console.error('Cancel upload error:', error);
    res.status(400).json({ 
      error: 'Failed to cancel upload job',
      message: error.message 
    });
  }
});

// Get all active upload jobs
router.get('/jobs/active', async (req, res) => {
  try {
    const activeJobs = uploadJobService.getActiveJobs();
    
    res.json({
      success: true,
      jobs: activeJobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        metadata: job.metadata
      }))
    });
  } catch (error) {
    console.error('Get active jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to get active jobs' 
    });
  }
});

// Get completed upload jobs
router.get('/jobs/completed', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const completedJobs = uploadJobService.getCompletedJobs(limit);
    
    res.json({
      success: true,
      jobs: completedJobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processedItems: job.processedItems,
        resultsCount: job.results.length,
        errorsCount: job.errors.length,
        skippedCount: job.skipped.length,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        cancelled: job.cancelled,
        cancellationReason: job.cancellationReason,
        metadata: job.metadata
      }))
    });
  } catch (error) {
    console.error('Get completed jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to get completed jobs' 
    });
  }
});

// Get upload job statistics
router.get('/jobs/stats', async (req, res) => {
  try {
    const stats = uploadJobService.getJobStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get job statistics' 
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

      // Generate enhanced CLIP embedding with tag information
      const imageBuffer = await fs.readFile(fileData.filePath);
      const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags);

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

          // Generate enhanced CLIP embedding with tag information
          const imageBuffer = await fs.readFile(fileData.filePath);
          const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags);

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

// CSV Import endpoint
router.post('/csv-import', upload.single('csvFile'), async (req, res) => {
  let job = null;
  
  try {
    await ensureTempDir();
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No CSV file provided' 
      });
    }

    // Check if file is CSV
    if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({ 
        error: 'File must be a CSV file' 
      });
    }

    const enableAutoTagging = req.body.enableAutoTagging === 'true';
    
    // Create upload job
    job = uploadJobService.createJob('csv-import', {
      filename: req.file.originalname,
      enableAutoTagging,
      fileSize: req.file.size
    });

    // Return job ID immediately for progress tracking
    res.json({
      success: true,
      message: 'CSV import started',
      jobId: job.id,
      status: 'pending'
    });

    // Process CSV in background
    processCsvImport(job.id, req.file.path, enableAutoTagging);

  } catch (error) {
    console.error('CSV import error:', error);
    
    if (job) {
      uploadJobService.updateJobStatus(job.id, 'failed', {
        error: error.message
      });
    }
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('CSV cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: 'CSV import failed',
      message: error.message 
    });
  }
});

// Background CSV processing function
async function processCsvImport(jobId, csvFilePath, enableAutoTagging) {
  const results = [];
  const errors = [];
  const skipped = [];
  const csvData = [];
  
  try {
    // Update job status to running
    uploadJobService.updateJobStatus(jobId, 'running');

    // Parse CSV file
    await new Promise((resolve, reject) => {
      const fsStream = require('fs').createReadStream(csvFilePath);
      fsStream
        .pipe(csv())
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Update total items
    uploadJobService.updateProgress(jobId, 0, csvData.length);

    // Validate CSV structure
    if (csvData.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Check required columns
    const firstRow = csvData[0];
    if (!firstRow.image_path || !firstRow.tags) {
      throw new Error('CSV must contain "image_path" and "tags" columns');
    }

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      // Check if job was cancelled
      if (uploadJobService.isJobCancelled(jobId)) {
        console.log(`❌ Job ${jobId} was cancelled, stopping processing at row ${i + 1}`);
        break;
      }

      const row = csvData[i];
      let tempFile = null;
      let downloadedFilePath = null;
      
      try {
        const imagePath = row.image_path.trim();
        const tagsString = row.tags.trim();
        
        // Check if image path is a URL or local file path
        if (isValidUrl(imagePath)) {
          // Handle external URL
          console.log(`📥 Downloading image from URL: ${imagePath}`);
          tempFile = await downloadImageFromUrl(imagePath, 'temp/');
          downloadedFilePath = tempFile.path;
        } else {
          // Handle local file path
          if (!fsSync.existsSync(imagePath)) {
            const error = {
              row: i + 1,
              imagePath,
              error: 'Image file not found',
              reason: 'FILE_NOT_FOUND'
            };
            errors.push(error);
            uploadJobService.addError(jobId, error);
            continue;
          }
          
          // Create a temporary file object for local files
          tempFile = {
            path: imagePath,
            originalname: path.basename(imagePath),
            mimetype: 'image/jpeg', // Default, will be validated by imageService
            size: fsSync.statSync(imagePath).size
          };
        }

        // Check for duplicates before processing
        const originalName = tempFile.originalname;
        const existingImage = await Image.checkIfExists(null, originalName);
        
        if (existingImage) {
          const skippedItem = {
            row: i + 1,
            imagePath,
            originalName,
            reason: 'DUPLICATE',
            existingImageId: existingImage.id,
            message: `Image already exists in database (ID: ${existingImage.id})`
          };
          skipped.push(skippedItem);
          uploadJobService.addSkipped(jobId, skippedItem);
          continue;
        }

        // Parse tags
        let tags = [];
        if (tagsString) {
          tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Generate auto tags if enabled and no tags provided
        let allTags = [...tags];
        if (enableAutoTagging && tags.length === 0) {
          const autoTags = await imageService.generateAutoTags(tempFile.path, tempFile.originalname);
          allTags = [...autoTags];
        }

        // Save file to permanent location
        const fileData = await imageService.saveFile(tempFile);
        
        // Generate enhanced CLIP embedding with tag information
        const imageBuffer = await fs.readFile(fileData.filePath);
        const embedding = await clipService.generateEnhancedImageEmbedding(imageBuffer, allTags);

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

        const result = {
          id: dbImage.id,
          filename: fileData.filename,
          originalName: fileData.originalName,
          tags: allTags,
          weaviateId
        };

        results.push(result);
        uploadJobService.addResult(jobId, result);

      } catch (error) {
        console.error(`Error processing CSV row ${i + 1}:`, error);
        
        // Categorize different types of errors
        let errorReason = 'UNKNOWN_ERROR';
        let errorMessage = error.message;
        
        if (error.message.includes('timeout')) {
          errorReason = 'DOWNLOAD_TIMEOUT';
          errorMessage = 'Image download timed out';
        } else if (error.message.includes('HTTP')) {
          errorReason = 'DOWNLOAD_FAILED';
          errorMessage = `Failed to download image: ${error.message}`;
        } else if (error.message.includes('Invalid content type')) {
          errorReason = 'INVALID_CONTENT_TYPE';
          errorMessage = 'URL does not point to a valid image file';
        } else if (error.message.includes('Unsupported image format')) {
          errorReason = 'UNSUPPORTED_FORMAT';
          errorMessage = 'Image format is not supported';
        } else if (error.message.includes('File size exceeds')) {
          errorReason = 'FILE_TOO_LARGE';
          errorMessage = 'Image file is too large';
        } else if (error.message.includes('File type')) {
          errorReason = 'INVALID_FILE_TYPE';
          errorMessage = 'File type is not allowed';
        } else if (error.message.includes('Weaviate')) {
          errorReason = 'VECTOR_DB_ERROR';
          errorMessage = 'Failed to store in vector database';
        } else if (error.message.includes('database')) {
          errorReason = 'DATABASE_ERROR';
          errorMessage = 'Failed to store in database';
        }
        
        const errorItem = {
          row: i + 1,
          imagePath: row.image_path,
          error: errorMessage,
          reason: errorReason,
          originalError: error.message
        };
        
        errors.push(errorItem);
        uploadJobService.addError(jobId, errorItem);
      } finally {
        // Clean up downloaded file if it was downloaded from URL
        if (downloadedFilePath && fsSync.existsSync(downloadedFilePath)) {
          try {
            await fs.unlink(downloadedFilePath);
          } catch (cleanupError) {
            console.error('Error cleaning up downloaded file:', cleanupError);
          }
        }
      }

      // Update progress
      uploadJobService.updateProgress(jobId, i + 1, csvData.length);
    }

    // Clean up uploaded CSV file
    try {
      await fs.unlink(csvFilePath);
    } catch (cleanupError) {
      console.error('CSV cleanup error:', cleanupError);
    }

    // Calculate summary statistics
    const totalRows = csvData.length;
    const imported = results.length;
    const failed = errors.length;
    const skippedCount = skipped.length;
    const processed = imported + failed + skippedCount;

    // Create detailed summary message
    let summaryMessage = `CSV import completed. Processed ${processed} of ${totalRows} rows: `;
    summaryMessage += `${imported} imported successfully`;
    
    if (skippedCount > 0) {
      summaryMessage += `, ${skippedCount} skipped (duplicates)`;
    }
    
    if (failed > 0) {
      summaryMessage += `, ${failed} failed`;
    }

    // Group errors by reason for better reporting
    const errorsByReason = errors.reduce((acc, error) => {
      const reason = error.reason || 'UNKNOWN_ERROR';
      if (!acc[reason]) {
        acc[reason] = [];
      }
      acc[reason].push(error);
      return acc;
    }, {});

    // Update job status to completed
    uploadJobService.updateJobStatus(jobId, 'completed', {
      summary: {
        totalRows,
        processed,
        imported,
        skipped: skippedCount,
        failed,
        successRate: totalRows > 0 ? ((imported / totalRows) * 100).toFixed(1) + '%' : '0%'
      },
      results,
      skipped,
      errors,
      errorsByReason,
      errorSummary: Object.keys(errorsByReason).map(reason => ({
        reason,
        count: errorsByReason[reason].length,
        description: getErrorDescription(reason),
        examples: errorsByReason[reason].slice(0, 3).map(err => ({
          row: err.row,
          imagePath: err.imagePath,
          error: err.error
        }))
      }))
    });

    console.log(`✅ CSV import job ${jobId} completed: ${summaryMessage}`);

  } catch (error) {
    console.error(`❌ CSV import job ${jobId} failed:`, error);
    
    // Update job status to failed
    uploadJobService.updateJobStatus(jobId, 'failed', {
      error: error.message,
      results,
      errors,
      skipped
    });

    // Clean up uploaded file if it exists
    try {
      await fs.unlink(csvFilePath);
    } catch (cleanupError) {
      console.error('CSV cleanup error:', cleanupError);
    }
  }
}

module.exports = router;

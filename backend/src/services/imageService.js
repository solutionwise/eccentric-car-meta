const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { predefinedTags, getAllConcepts, extractTagFromConcept, categorizeTag } = require('../data/predefinedTags');

class ImageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    this.ensureUploadDir();
    this.model = process.env.CLIP_MODEL;
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log(`✅ Upload directory created: ${this.uploadDir}`);
    }
  }

  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${randomString}${ext}`;
  }

  async processImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        density: metadata.density
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  async resizeImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
      } = options;

      await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }

  async generateThumbnail(inputPath, outputPath, size = 200) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async saveFile(file, customFilename = null) {
    try {
      const filename = customFilename || this.generateUniqueFilename(file.originalname);
      const filePath = path.join(this.uploadDir, filename);
      
      // Move file to upload directory
      await fs.rename(file.path, filePath);
      
      // Process image to get metadata
      const metadata = await this.processImage(filePath);
      
      return {
        filename,
        originalName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileStats() {
    try {
      const files = await fs.readdir(this.uploadDir);
      const stats = {
        totalFiles: files.length,
        totalSize: 0
      };

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stat = await fs.stat(filePath);
        stats.totalSize += stat.size;
      }

      stats.totalSizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
      return stats;
    } catch (error) {
      console.error('Error getting file stats:', error);
      return { totalFiles: 0, totalSize: 0, totalSizeMB: '0' };
    }
  }

  // Comprehensive auto-tagging using CLIP and predefined categories
  async generateAutoTags(imagePath, originalName = '') {
    try {
      const tags = new Set();

      // 1. Extract tags from filename (fallback)
      // const filenameTags = this.extractTagsFromFilename(originalName, predefinedTags);
      // filenameTags.forEach(tag => tags.add(tag));

      // 2. Generate CLIP-based tags from image content
      const clipTags = await this.generateClipTags(imagePath);
      clipTags.forEach(tag => tags.add(tag));

      // 3. Extract tags from image metadata
      // const metadataTags = this.extractTagsFromMetadata(metadata);
      // metadataTags.forEach(tag => tags.add(tag));

      // 4. Add technical tags
      // tags.add(metadata.format);
      
      // if (metadata.width > metadata.height) {
      //   tags.add('landscape');
      // } else if (metadata.height > metadata.width) {
      //   tags.add('portrait');
      // } else {
      //   tags.add('square');
      // }

      // if (metadata.width > 2000 || metadata.height > 2000) {
      //   tags.add('high-resolution');
      // } else {
      //   tags.add('standard-resolution');
      // }

      return Array.from(tags);
    } catch (error) {
      console.error('Error generating auto tags:', error);
      return [];
    }
  }

  async classifyCategory(model, imagePath, labels, threshold = 0.2, topK = 1) {
    const results = await model(imagePath, labels);
    results.sort((a, b) => b.score - a.score);
  
    // Top K with threshold
    return results.filter((r, i) => i < topK && r.score >= threshold);
  }
  
  async generateClipTags(imagePath) {
    const clipService = require('./clipService');
    await clipService.initialize();
  
    const tags = [];
  
    // Brand
    const brand = await this.classifyCategory(clipService.model, imagePath, predefinedTags.brands, 0.15, 1);
    if (brand.length) tags.push(brand[0].label);
  
    // Color
    const color = await this.classifyCategory(clipService.model, imagePath, predefinedTags.colors, 0.15, 1);
    if (color.length) tags.push(color[0].label);
  
    // Type
    const type = await this.classifyCategory(clipService.model, imagePath, predefinedTags.types, 0.15, 1);
    if (type.length) tags.push(type[0].label);
  
    // Features (keep multiple)
    const features = await this.classifyCategory(clipService.model, imagePath, predefinedTags.features, 0.4, 5);
    tags.push(...features.map(f => f.label));
  
    console.log("✅ Tags:", tags);
    return tags;
  }
  // Generate tags using transformers.js zero-shot classification
  // async generateClipTags(imagePath) {
  //   try {
  //     const clipService = require('./clipService');
      
  //     console.log('🖼️ Starting CLIP-based auto-tagging with zero-shot classification...');
      
  //     // Ensure CLIP service is initialized
  //     await clipService.initialize();
      
  //     // Get all automotive concepts from predefined tags
  //     const automotiveConcepts = getAllConcepts();
  //     console.log(`📋 Testing ${automotiveConcepts.length} automotive concepts...`);
      
  //     // Use direct zero-shot classification instead of embeddings
  //     const results = await clipService.model(imagePath, automotiveConcepts);
      
  //     console.log(`✅ Completed zero-shot classification`);
      
  //     // Sort by similarity score (highest first)
  //     results.sort((a, b) => b.score - a.score);
      
  //     // Define similarity thresholds for each category (optimized for zero-shot classification)
  //     const thresholds = {
  //       brand: 0.1,     // Threshold for brand detection
  //       color: 0.05,    // Threshold for color detection
  //       type: 0.05,     // Threshold for vehicle type
  //       feature: 0.05,  // Threshold for features
  //       general: 0.05   // Threshold for general automotive concepts
  //     };
      
  //     // Structure to hold best match from each category
  //     const categorizedTags = {
  //       brand: { tag: null, score: 0 },
  //       color: { tag: null, score: 0 },
  //       type: { tag: null, score: 0 },
  //       features: [], // Multiple features allowed
  //       general: { tag: null, score: 0 }
  //     };
      
  //     // Track if any vehicle-related concept was detected
  //     let vehicleDetected = false;
  //     let vehicleConfidence = 0;
      
  //     console.log('🏷️ Analyzing results and selecting best matches...');
      
  //     // Process results and find best match from each category
  //     results.forEach(result => {
  //       const concept = result.label;
  //       const score = result.score;
        
  //       // Extract tag from concept
  //       const tag = extractTagFromConcept(concept);
  //       const category = categorizeTag(tag);
        
  //       // Check if this is a vehicle-related concept
  //       if (concept.includes('car') || concept.includes('vehicle') || concept.includes('automobile') || 
  //           concept.includes('truck') || concept.includes('suv') || concept.includes('sedan') ||
  //           concept.includes('coupe') || concept.includes('hatchback') || concept.includes('convertible')) {
  //         vehicleDetected = true;
  //         vehicleConfidence = Math.max(vehicleConfidence, score);
  //       }
        
  //       // Apply category-specific logic
  //       switch (category) {
  //         case 'brand':
  //           if (score > thresholds.brand && score > categorizedTags.brand.score) {
  //             categorizedTags.brand = { tag, score };
  //           }
  //           break;
            
  //         case 'color':
  //           if (score > thresholds.color && score > categorizedTags.color.score) {
  //             categorizedTags.color = { tag, score };
  //           }
  //           break;
            
  //         case 'type':
  //           if (score > thresholds.type && score > categorizedTags.type.score) {
  //             categorizedTags.type = { tag, score };
  //           }
  //           break;
            
  //         case 'feature':
  //           if (score > thresholds.feature) {
  //             // Add feature if not already present and score is good
  //             const existingFeature = categorizedTags.features.find(f => f.tag === tag);
  //             if (!existingFeature) {
  //               categorizedTags.features.push({ tag, score });
  //             } else if (score > existingFeature.score) {
  //               existingFeature.score = score;
  //             }
  //           }
  //           break;
            
  //         default:
  //           // General automotive concepts
  //           if (score > thresholds.general && score > categorizedTags.general.score) {
  //             categorizedTags.general = { tag, score };
  //           }
  //           break;
  //       }
  //     });
      
  //     // Sort features by score (highest first)
  //     categorizedTags.features.sort((a, b) => b.score - a.score);
      
  //     // Limit features to top 10 as requested
  //     categorizedTags.features = categorizedTags.features.slice(0, 10);
      
  //     // Validate that a vehicle was detected
  //     if (!vehicleDetected || vehicleConfidence < 0.01) {
  //       console.warn('⚠️ No vehicle detected in the image or low confidence');
  //       console.log(`   Vehicle detected: ${vehicleDetected}, confidence: ${vehicleConfidence.toFixed(4)}`);
  //       return [];
  //     }
      
  //     // Build final tags array with best matches from each category
  //     const finalTags = [];
      
  //     // Add best brand if found
  //     if (categorizedTags.brand.tag) {
  //       finalTags.push(categorizedTags.brand.tag);
  //       console.log(`🏷️ Brand: ${categorizedTags.brand.tag} (score: ${categorizedTags.brand.score.toFixed(3)})`);
  //     }
      
  //     // Add best color if found
  //     if (categorizedTags.color.tag) {
  //       finalTags.push(categorizedTags.color.tag);
  //       console.log(`🎨 Color: ${categorizedTags.color.tag} (score: ${categorizedTags.color.score.toFixed(3)})`);
  //     }
      
  //     // Add best vehicle type if found
  //     if (categorizedTags.type.tag) {
  //       finalTags.push(categorizedTags.type.tag);
  //       console.log(`🚗 Type: ${categorizedTags.type.tag} (score: ${categorizedTags.type.score.toFixed(3)})`);
  //     }
      
  //     // Add top features
  //     categorizedTags.features.forEach(feature => {
  //       finalTags.push(feature.tag);
  //       console.log(`⚙️ Feature: ${feature.tag} (score: ${feature.score.toFixed(3)})`);
  //     });
      
  //     // Add general automotive concept if found and no specific type
  //     if (categorizedTags.general.tag && !categorizedTags.type.tag) {
  //       finalTags.push(categorizedTags.general.tag);
  //       console.log(`🚙 General: ${categorizedTags.general.tag} (score: ${categorizedTags.general.score.toFixed(3)})`);
  //     }
      
  //     console.log(`✅ Generated ${finalTags.length} auto-tags: ${finalTags.join(', ')}`);
  //     return finalTags;
      
  //   } catch (error) {
  //     console.error('Image classification tagging failed:', error);
  //     // Return empty array instead of throwing to allow fallback to filename-based tagging
  //     return [];
  //   }
  // }

  // Extract tags from filename using predefined categories
  extractTagsFromFilename(filename, predefinedTags) {
    const tags = new Set();
    const lowerFilename = filename.toLowerCase();

    // Check for colors
    predefinedTags.colors.forEach(color => {
      if (lowerFilename.includes(color)) {
        tags.add(color);
      }
    });

    // Check for vehicle types
    predefinedTags.types.forEach(type => {
      if (lowerFilename.includes(type)) {
        tags.add(type);
      }
    });

    // Check for features
    predefinedTags.features.forEach(feature => {
      if (lowerFilename.includes(feature.replace(' ', '')) || 
          lowerFilename.includes(feature.replace(' ', '-'))) {
        tags.add(feature);
      }
    });

    // Check for brands
    predefinedTags.brands.forEach(brand => {
      if (lowerFilename.includes(brand)) {
        tags.add(brand);
      }
    });

    // Additional pattern matching
    if (lowerFilename.includes('sport') || lowerFilename.includes('sports')) {
      tags.add('sporty');
    }
    if (lowerFilename.includes('luxury') || lowerFilename.includes('premium')) {
      tags.add('luxury');
    }
    if (lowerFilename.includes('family')) {
      tags.add('family');
    }
    if (lowerFilename.includes('fast') || lowerFilename.includes('speed')) {
      tags.add('fast');
    }
    if (lowerFilename.includes('economy') || lowerFilename.includes('economical')) {
      tags.add('economical');
    }

    return Array.from(tags);
  }

  // Extract tags from image metadata
  extractTagsFromMetadata(metadata) {
    const tags = new Set();

    // File size based tags
    if (metadata.size > 5 * 1024 * 1024) { // > 5MB
      tags.add('large-file');
    } else if (metadata.size < 500 * 1024) { // < 500KB
      tags.add('small-file');
    }

    // Resolution based tags
    if (metadata.width >= 1920 && metadata.height >= 1080) {
      tags.add('hd');
    }
    if (metadata.width >= 3840 && metadata.height >= 2160) {
      tags.add('4k');
    }

    // Aspect ratio based tags
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio > 1.5) {
      tags.add('wide');
    } else if (aspectRatio < 0.8) {
      tags.add('tall');
    }

    return Array.from(tags);
  }

  // Extract EXIF data for additional metadata
  async extractExifData(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const exif = metadata.exif;

      if (!exif) {
        return null;
      }

      // Parse EXIF data (basic implementation)
      return {
        camera: exif.Make || 'Unknown',
        model: exif.Model || 'Unknown',
        dateTaken: exif.DateTime || null,
        iso: exif.ISO || null,
        aperture: exif.FNumber || null,
        shutterSpeed: exif.ExposureTime || null
      };
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
      return null;
    }
  }
}

module.exports = new ImageService();

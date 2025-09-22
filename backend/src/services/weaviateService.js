const weaviate = require('weaviate-ts-client');

class WeaviateService {
  constructor() {
    this.client = weaviate.default.client({
      scheme: 'http',
      host: process.env.WEAVIATE_URL || 'localhost:8080',
    });
    this.className = 'AutomotiveImage';
    this.init();
  }

  async init() {
    try {
      // Check if class exists, if not create it
      const classExists = await this.client.schema.exists(this.className);
      if (!classExists) {
        await this.createSchema();
        console.log('✅ Weaviate schema created');
      } else {
        console.log('✅ Weaviate schema exists');
      }
    } catch (error) {
      console.error('❌ Error initializing Weaviate:', error);
    }
  }

  async createSchema() {
    const classDefinition = {
      class: this.className,
      description: 'Automotive images with CLIP embeddings',
      vectorizer: 'none', // We'll provide our own embeddings
      properties: [
        {
          name: 'filename',
          dataType: ['string'],
          description: 'Image filename'
        },
        {
          name: 'originalName',
          dataType: ['string'],
          description: 'Original image name'
        },
        {
          name: 'filePath',
          dataType: ['string'],
          description: 'Path to the image file'
        },
        {
          name: 'tags',
          dataType: ['string[]'],
          description: 'Image tags'
        },
        {
          name: 'metadata',
          dataType: ['text'],
          description: 'Additional image metadata as JSON string'
        }
      ]
    };

    await this.client.schema.classCreator().withClass(classDefinition).do();
  }

  async addImage(imageData, embedding) {
    try {
      const properties = {
        filename: imageData.filename,
        originalName: imageData.originalName,
        filePath: imageData.filePath,
        tags: imageData.tags || [],
        metadata: JSON.stringify({
          fileSize: imageData.fileSize,
          mimeType: imageData.mimeType,
          width: imageData.width,
          height: imageData.height,
          createdAt: new Date().toISOString()
        })
      };

      const result = await this.client.data
        .creator()
        .withClassName(this.className)
        .withProperties(properties)
        .withVector(embedding)
        .do();

      return result.id;
    } catch (error) {
      console.error('Error adding image to Weaviate:', error);
      throw error;
    }
  }

  async searchImages(queryEmbedding, limit = 10) {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('filename originalName filePath tags metadata _additional { id distance }')
        .withNearVector({
          vector: queryEmbedding,
          distance: 1.5 // More permissive threshold for better search results
        })
        .withLimit(limit)
        .do();

      const results = result.data.Get[this.className] || [];
      // Parse metadata from JSON string back to object
      return results.map(item => {
        let metadata = null;
        try {
          metadata = item.metadata ? JSON.parse(item.metadata) : null;
        } catch (error) {
          console.warn('Failed to parse metadata in Weaviate result:', error.message);
          metadata = null;
        }
        
        return {
          ...item,
          metadata: metadata
        };
      });
    } catch (error) {
      console.error('Error searching images in Weaviate:', error);
      throw error;
    }
  }

  async getImageById(id) {
    try {
      const result = await this.client.data
        .getterById()
        .withId(id)
        .withClassName(this.className)
        .do();

      return result;
    } catch (error) {
      console.error('Error getting image from Weaviate:', error);
      throw error;
    }
  }

  async deleteImage(id) {
    try {
      await this.client.data
        .deleter()
        .withId(id)
        .withClassName(this.className)
        .do();

      return true;
    } catch (error) {
      console.error('Error deleting image from Weaviate:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const result = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('meta { count }')
        .do();

      return result.data.Aggregate[this.className][0].meta.count;
    } catch (error) {
      console.error('Error getting Weaviate stats:', error);
      return 0;
    }
  }

  // Update tags for an existing image in Weaviate
  async updateImageTags(weaviateId, tags) {
    try {
      console.log(`Updating tags for Weaviate ID: ${weaviateId}`);
      
      const result = await this.client.data
        .updater()
        .withClassName(this.className)
        .withId(weaviateId)
        .withProperties({
          tags: tags
        })
        .do();

      console.log('✅ Tags updated in Weaviate successfully');
      return result;
    } catch (error) {
      console.error('Error updating tags in Weaviate:', error);
      throw error;
    }
  }

  // Search images by tags using Weaviate GraphQL
  async searchImagesByTags(tags, limit = 10) {
    try {
      console.log(`🔍 Searching Weaviate by tags: ${tags.join(', ')}`);
      
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('filename originalName filePath tags metadata _additional { id }')
        .withWhere({
          operator: 'And',
          operands: tags.map(tag => ({
            path: ['tags'],
            operator: 'ContainsAny',
            valueText: [tag]
          }))
        })
        .withLimit(limit)
        .do();

      const results = result.data.Get[this.className] || [];
      
      // Parse metadata from JSON string back to object
      return results.map(item => {
        let metadata = null;
        try {
          metadata = item.metadata ? JSON.parse(item.metadata) : null;
        } catch (error) {
          console.warn('Failed to parse metadata in Weaviate tag search result:', error.message);
          metadata = null;
        }
        
        return {
          ...item,
          metadata: metadata,
          searchType: 'tag'
        };
      });
    } catch (error) {
      console.error('Error searching images by tags in Weaviate:', error);
      throw error;
    }
  }

  // Combined search: semantic similarity + tag filtering
  async searchImagesWithTags(queryEmbedding, tags = [], limit = 10) {
    try {
      console.log(`🔍 Combined search: semantic + tags (${tags.join(', ')})`);
      
      let query = this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('filename originalName filePath tags metadata _additional { id distance }')
        .withNearVector({
          vector: queryEmbedding,
          distance: 1.5
        });

      // Add tag filtering if tags are provided
      if (tags && tags.length > 0) {
        query = query.withWhere({
          operator: 'Or',
          operands: tags.map(tag => ({
            path: ['tags'],
            operator: 'ContainsAny',
            valueText: [tag]
          }))
        });
      }

      const result = await query.withLimit(limit).do();
      const results = result.data.Get[this.className] || [];
      
      // Parse metadata from JSON string back to object
      return results.map(item => {
        let metadata = null;
        try {
          metadata = item.metadata ? JSON.parse(item.metadata) : null;
        } catch (error) {
          console.warn('Failed to parse metadata in Weaviate combined search result:', error.message);
          metadata = null;
        }
        
        return {
          ...item,
          metadata: metadata,
          searchType: tags.length > 0 ? 'semantic-tag' : 'semantic'
        };
      });
    } catch (error) {
      console.error('Error in combined search:', error);
      throw error;
    }
  }
}

module.exports = new WeaviateService();

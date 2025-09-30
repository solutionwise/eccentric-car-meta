const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Image {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './database.sqlite';
    this.db = new sqlite3.Database(this.dbPath);
    this.init();
  }

  init() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        weaviate_id TEXT UNIQUE
      )
    `;
    
    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating images table:', err);
      } else {
        console.log('✅ Images table ready');
      }
    });
  }

  async create(imageData) {
    return new Promise((resolve, reject) => {
      const {
        filename,
        originalName,
        filePath,
        fileSize,
        mimeType,
        width,
        height,
        tags,
        weaviateId
      } = imageData;

      const query = `
        INSERT INTO images (
          filename, original_name, file_path, file_size, mime_type,
          width, height, tags, weaviate_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        filename, originalName, filePath, fileSize, mimeType,
        width, height, JSON.stringify(tags), weaviateId
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...imageData });
        }
      });
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE id = ?';
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  async findAll(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?';
      this.db.all(query, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const processedRows = rows.map(row => {
            if (row.tags) {
              row.tags = JSON.parse(row.tags);
            }
            return row;
          });
          resolve(processedRows);
        }
      });
    });
  }

  async findByWeaviateId(weaviateId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE weaviate_id = ?';
      this.db.get(query, [weaviateId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  async update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(key === 'tags' ? JSON.stringify(updateData[key]) : updateData[key]);
        }
      });

      if (fields.length === 0) {
        resolve(null);
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE images SET ${fields.join(', ')} WHERE id = ?`;
      
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM images WHERE id = ?';
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async searchByTags(tags, limit = 10) {
    return new Promise((resolve, reject) => {
      const tagConditions = tags.map(() => 'tags LIKE ?').join(' AND ');
      const tagValues = tags.map(tag => `%"${tag}"%`);
      
      const query = `SELECT * FROM images WHERE ${tagConditions} ORDER BY created_at DESC LIMIT ?`;
      this.db.all(query, [...tagValues, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const processedRows = rows.map(row => {
            if (row.tags) {
              row.tags = JSON.parse(row.tags);
            }
            return row;
          });
          resolve(processedRows);
        }
      });
    });
  }

  async findByFilePath(filePath) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE file_path = ?';
      this.db.get(query, [filePath], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  async findByOriginalName(originalName) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE original_name = ?';
      this.db.get(query, [originalName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  async checkIfExists(filePath, originalName) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM images WHERE file_path = ? OR original_name = ?';
      this.db.get(query, [filePath, originalName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row && row.tags) {
            row.tags = JSON.parse(row.tags);
          }
          resolve(row);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Image();

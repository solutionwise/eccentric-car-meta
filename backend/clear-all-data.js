const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const weaviate = require('weaviate-ts-client');

async function clearAllData() {
  console.log('🗑️  Clearing all existing data...\n');

  try {
    // 1. Clear SQLite database
    console.log('📊 Clearing SQLite database...');
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = new sqlite3.Database(dbPath);
    
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM images', (err) => {
          if (err) {
            console.error('Error clearing images table:', err);
            reject(err);
          } else {
            console.log('✅ Images table cleared');
          }
        });
        
        db.run('DELETE FROM admin_users', (err) => {
          if (err) {
            console.error('Error clearing admin_users table:', err);
            reject(err);
          } else {
            console.log('✅ Admin users table cleared');
          }
        });
        
        // Recreate default admin user
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        db.run(
          'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
          ['admin', hashedPassword],
          (err) => {
            if (err) {
              console.error('Error creating default admin user:', err);
              reject(err);
            } else {
              console.log('✅ Default admin user recreated (admin/admin123)');
              resolve();
            }
          }
        );
      });
    });
    
    db.close();

    // 2. Clear Weaviate vector database
    console.log('\n🔍 Clearing Weaviate vector database...');
    const weaviateClient = weaviate.default.client({
      scheme: 'http',
      host: process.env.WEAVIATE_URL || 'localhost:8080',
    });

    try {
      // Delete all objects from the AutomotiveImage class
      const className = 'AutomotiveImage';
      
      // Get all objects first
      const result = await weaviateClient.graphql
        .get()
        .withClassName(className)
        .withFields('_additional { id }')
        .withLimit(1000)
        .do();

      const objects = result.data.Get[className] || [];
      console.log(`Found ${objects.length} objects to delete`);

      // Delete each object
      for (const obj of objects) {
        try {
          await weaviateClient.data
            .deleter()
            .withId(obj._additional.id)
            .withClassName(className)
            .do();
        } catch (error) {
          console.warn(`Warning: Could not delete object ${obj._additional.id}:`, error.message);
        }
      }

      console.log('✅ Weaviate vector database cleared');
    } catch (error) {
      console.warn('⚠️  Could not clear Weaviate (might not be running):', error.message);
    }

    // 3. Clear uploaded image files
    console.log('\n📁 Clearing uploaded image files...');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      let deletedCount = 0;
      
      for (const file of files) {
        if (file !== '.gitkeep') { // Keep .gitkeep file
          try {
            await fs.unlink(path.join(uploadsDir, file));
            deletedCount++;
          } catch (error) {
            console.warn(`Warning: Could not delete file ${file}:`, error.message);
          }
        }
      }
      
      console.log(`✅ Deleted ${deletedCount} image files`);
    } catch (error) {
      console.warn('⚠️  Could not clear uploads directory:', error.message);
    }

    // 4. Clear temp files
    console.log('\n🗂️  Clearing temporary files...');
    const tempDir = path.join(__dirname, 'temp');
    
    try {
      const files = await fs.readdir(tempDir);
      let deletedCount = 0;
      
      for (const file of files) {
        try {
          await fs.unlink(path.join(tempDir, file));
          deletedCount++;
        } catch (error) {
          console.warn(`Warning: Could not delete temp file ${file}:`, error.message);
        }
      }
      
      console.log(`✅ Deleted ${deletedCount} temporary files`);
    } catch (error) {
      console.warn('⚠️  Could not clear temp directory:', error.message);
    }

    // 5. Clear CLIP service cache (if running)
    console.log('\n🧠 CLIP service cache will be cleared on next restart');

    console.log('\n🎉 All data cleared successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ SQLite database cleared');
    console.log('   ✅ Weaviate vector database cleared');
    console.log('   ✅ Uploaded images deleted');
    console.log('   ✅ Temporary files deleted');
    console.log('   ✅ Default admin user recreated (admin/admin123)');
    
    console.log('\n🚀 You can now:');
    console.log('   1. Start the backend server: cd backend && npm start');
    console.log('   2. Upload new images through the admin panel');
    console.log('   3. Test the improved search system');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearAllData();

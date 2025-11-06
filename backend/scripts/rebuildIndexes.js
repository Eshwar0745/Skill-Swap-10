/**
 * Script to rebuild indexes after schema changes
 * This drops old indexes and creates new ones based on the updated schema
 * 
 * Usage: node scripts/rebuildIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function rebuildIndexes() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set in .env');
    }
    
    await mongoose.connect(uri, {
      dbName: process.env.MONGO_DB || undefined,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop and rebuild OfferedSkill indexes
    console.log('\n📋 Rebuilding OfferedSkill indexes...');
    try {
      await db.collection('offeredskills').dropIndexes();
      console.log('  ✓ Dropped old indexes');
    } catch (err) {
      console.log('  ℹ No indexes to drop or collection does not exist');
    }
    
    // Create new indexes
    await db.collection('offeredskills').createIndex({ title: 'text', description: 'text' });
    await db.collection('offeredskills').createIndex({ categories: 1 });
    await db.collection('offeredskills').createIndex({ tags: 1 });
    await db.collection('offeredskills').createIndex({ user: 1, createdAt: -1 });
    console.log('  ✓ Created new indexes');

    // Drop and rebuild RequestedSkill indexes
    console.log('\n📋 Rebuilding RequestedSkill indexes...');
    try {
      await db.collection('requestedskills').dropIndexes();
      console.log('  ✓ Dropped old indexes');
    } catch (err) {
      console.log('  ℹ No indexes to drop or collection does not exist');
    }
    
    // Create new indexes
    await db.collection('requestedskills').createIndex({ title: 'text', description: 'text' });
    await db.collection('requestedskills').createIndex({ categories: 1 });
    await db.collection('requestedskills').createIndex({ tags: 1 });
    await db.collection('requestedskills').createIndex({ user: 1, createdAt: -1 });
    console.log('  ✓ Created new indexes');

    // Show current indexes
    console.log('\n📊 Current OfferedSkill indexes:');
    const offeredIndexes = await db.collection('offeredskills').indexes();
    offeredIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n📊 Current RequestedSkill indexes:');
    const requestedIndexes = await db.collection('requestedskills').indexes();
    requestedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ Index rebuild completed successfully!');
    
  } catch (error) {
    console.error('❌ Index rebuild failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
rebuildIndexes();

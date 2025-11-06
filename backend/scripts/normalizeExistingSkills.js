/**
 * Migration script to normalize existing skills in the database
 * Run this once to clean up any existing duplicate categories/skills
 * 
 * Usage: node scripts/normalizeExistingSkills.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const OfferedSkill = require('../models/OfferedSkill');
const RequestedSkill = require('../models/RequestedSkill');
const { normalizeCategories } = require('../constants/categories');
const { normalizeSkillTitle, normalizeTags } = require('../utils/normalizeSkill');

async function normalizeExistingSkills() {
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

    // Normalize offered skills
    console.log('\n📋 Normalizing offered skills...');
    const offeredSkills = await OfferedSkill.find({});
    let offeredCount = 0;
    
    for (const skill of offeredSkills) {
      let updated = false;
      
      if (skill.title) {
        const normalizedTitle = normalizeSkillTitle(skill.title);
        if (normalizedTitle !== skill.title) {
          skill.title = normalizedTitle;
          updated = true;
        }
      }
      
      if (skill.categories && skill.categories.length > 0) {
        const normalizedCategories = normalizeCategories(skill.categories);
        if (JSON.stringify(normalizedCategories) !== JSON.stringify(skill.categories)) {
          skill.categories = normalizedCategories;
          updated = true;
        }
      }
      
      if (skill.tags && skill.tags.length > 0) {
        const normalizedTags = normalizeTags(skill.tags);
        if (JSON.stringify(normalizedTags) !== JSON.stringify(skill.tags)) {
          skill.tags = normalizedTags;
          updated = true;
        }
      }
      
      if (updated) {
        await skill.save();
        offeredCount++;
        console.log(`  ✓ Updated: ${skill.title}`);
      }
    }
    
    console.log(`✅ Normalized ${offeredCount} offered skills`);

    // Normalize requested skills
    console.log('\n📋 Normalizing requested skills...');
    const requestedSkills = await RequestedSkill.find({});
    let requestedCount = 0;
    
    for (const skill of requestedSkills) {
      let updated = false;
      
      if (skill.title) {
        const normalizedTitle = normalizeSkillTitle(skill.title);
        if (normalizedTitle !== skill.title) {
          skill.title = normalizedTitle;
          updated = true;
        }
      }
      
      if (skill.categories && skill.categories.length > 0) {
        const normalizedCategories = normalizeCategories(skill.categories);
        if (JSON.stringify(normalizedCategories) !== JSON.stringify(skill.categories)) {
          skill.categories = normalizedCategories;
          updated = true;
        }
      }
      
      if (skill.tags && skill.tags.length > 0) {
        const normalizedTags = normalizeTags(skill.tags);
        if (JSON.stringify(normalizedTags) !== JSON.stringify(skill.tags)) {
          skill.tags = normalizedTags;
          updated = true;
        }
      }
      
      if (updated) {
        await skill.save();
        requestedCount++;
        console.log(`  ✓ Updated: ${skill.title}`);
      }
    }
    
    console.log(`✅ Normalized ${requestedCount} requested skills`);

    // Show statistics
    console.log('\n📊 Statistics:');
    console.log(`  Total offered skills: ${offeredSkills.length}`);
    console.log(`  Total requested skills: ${requestedSkills.length}`);
    console.log(`  Updated offered skills: ${offeredCount}`);
    console.log(`  Updated requested skills: ${requestedCount}`);
    
    // Show unique categories
    const allOfferedCategories = offeredSkills.flatMap(s => s.categories || []);
    const allRequestedCategories = requestedSkills.flatMap(s => s.categories || []);
    const uniqueCategories = [...new Set([...allOfferedCategories, ...allRequestedCategories])];
    
    console.log('\n📂 Unique categories in database:');
    uniqueCategories.forEach(cat => console.log(`  - ${cat}`));

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
normalizeExistingSkills();

// Simple script to prepare the public release by replacing creatures.ts with public version
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing public release...');

// Paths
const creaturesPath = path.join(__dirname, '../src/data/creatures.ts');
const publicCreaturesPath = path.join(__dirname, '../src/data/creatures-public.ts');
const backupPath = path.join(__dirname, '../src/data/creatures-original.ts');

try {
  // 1. Create backup of original creatures file if it doesn't exist
  if (!fs.existsSync(backupPath)) {
    console.log('📋 Creating backup of original creatures file...');
    fs.copyFileSync(creaturesPath, backupPath);
    console.log('✅ Original creatures backed up to creatures-original.ts');
  }

  // 2. Replace creatures.ts with public version
  if (fs.existsSync(publicCreaturesPath)) {
    console.log('🔄 Replacing creatures.ts with public version...');
    fs.copyFileSync(publicCreaturesPath, creaturesPath);
    console.log('✅ creatures.ts replaced with public version (only Yokario)');
  } else {
    console.error('❌ Public creatures file not found at:', publicCreaturesPath);
    process.exit(1);
  }

  console.log('');
  console.log('🎉 Public release prepared successfully!');
  console.log('');

} catch (error) {
  console.error('❌ Error preparing public release:', error.message);
  process.exit(1);
}
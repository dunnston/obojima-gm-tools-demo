// Script to prepare the public release by replacing creatures.ts with public version
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

  // 3. Run the backup script to ensure we have JSON backups
  console.log('💾 Creating JSON backup...');
  const backupScript = path.join(__dirname, 'create-backup.js');
  if (fs.existsSync(backupScript)) {
    require('./create-backup.js');
  }

  console.log('');
  console.log('🎉 Public release prepared successfully!');
  console.log('');
  console.log('📁 Files created:');
  console.log('   - creatures.ts (public version with only Yokario)');
  console.log('   - creatures-original.ts (backup of your full data)');
  console.log('   - backups/creatures-full-backup.json (JSON export)');
  console.log('');
  console.log('🔧 To restore your working version:');
  console.log('   npm run restore-full-creatures');
  console.log('');
  console.log('📤 You can now build and share the public version!');
  console.log('   The JSON backup can be shared separately if desired.');

} catch (error) {
  console.error('❌ Error preparing public release:', error.message);
  process.exit(1);
}
// Script to restore the full creatures data for working copy
const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring full creatures data...');

// Paths
const creaturesPath = path.join(__dirname, '../src/data/creatures.ts');
const backupPath = path.join(__dirname, '../src/data/creatures-original.ts');

try {
  // Check if backup exists
  if (!fs.existsSync(backupPath)) {
    console.error('❌ No backup found at creatures-original.ts');
    console.log('💡 If you have a creatures-full-backup.ts file, you can manually restore it.');
    process.exit(1);
  }

  // Restore from backup
  console.log('📋 Restoring from creatures-original.ts...');
  fs.copyFileSync(backupPath, creaturesPath);
  
  console.log('✅ Full creatures data restored successfully!');
  console.log('🎯 You now have access to all your creature data again.');
  
} catch (error) {
  console.error('❌ Error restoring creatures data:', error.message);
  process.exit(1);
}
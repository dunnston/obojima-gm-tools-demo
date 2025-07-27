// Simple backup script that preserves your data without conversion
const fs = require('fs');
const path = require('path');

console.log('📋 Creating backup of creatures.ts...');

// Paths
const creaturesPath = path.join(__dirname, '../src/data/creatures.ts');
const backupDir = path.join(__dirname, '../backups');

try {
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  // Create timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `creatures-backup-${timestamp}.ts`);
  
  // Copy the entire file
  fs.copyFileSync(creaturesPath, backupPath);
  console.log(`✅ Complete backup created: ${backupPath}`);
  
  // Also create a general backup file
  const generalBackupPath = path.join(backupDir, 'creatures-full-backup.ts');
  fs.copyFileSync(creaturesPath, generalBackupPath);
  console.log(`✅ General backup updated: ${generalBackupPath}`);
  
  console.log('');
  console.log('💡 Note: For JSON format, users can export from the app interface');
  console.log('   or manually convert this TypeScript file as needed.');
  
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
  process.exit(1);
}
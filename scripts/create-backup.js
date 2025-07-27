// Script to create a complete backup of creature data for safekeeping
const fs = require('fs');
const path = require('path');

// Read the current creatures file
const creaturesPath = path.join(__dirname, '../src/data/creatures.ts');
const content = fs.readFileSync(creaturesPath, 'utf8');

// Extract the creatures array
const match = content.match(/export const creatures[^=]*=\s*(\[[\s\S]*?\]);/);

if (match) {
  const creaturesArray = match[1];
  
  // Clean up and format as JSON
  let jsonData = creaturesArray;
  jsonData = jsonData.replace(/(\w+):/g, '"$1":'); // Quote keys
  jsonData = jsonData.replace(/'/g, '"'); // Replace single quotes with double quotes
  jsonData = jsonData.replace(/,(\s*[\]}])/g, '$1'); // Remove trailing commas
  
  // Parse and re-stringify to ensure valid JSON formatting
  try {
    const parsed = JSON.parse(jsonData);
    const formattedJson = JSON.stringify(parsed, null, 2);
    
    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `creatures-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupPath, formattedJson);
    console.log(`✅ Complete creature backup created: ${backupPath}`);
    console.log(`📊 Backed up ${parsed.length} creatures`);
    
    // Also create a general backup file
    const generalBackupPath = path.join(backupDir, 'creatures-full-backup.json');
    fs.writeFileSync(generalBackupPath, formattedJson);
    console.log(`✅ General backup updated: ${generalBackupPath}`);
    
  } catch (error) {
    console.error('❌ Error parsing creatures data:', error.message);
    process.exit(1);
  }
  
} else {
  console.error('❌ Could not find creatures array in creatures.ts');
  process.exit(1);
}
const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('🚨 POTION WIPE SCRIPT');
console.log('='.repeat(60));
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // First, show current state
  console.log('\n📊 Current database state:');
  const currentPotions = db.prepare('SELECT COUNT(*) as count FROM user_potions').get();
  console.log(`Total potions in database: ${currentPotions.count}`);
  
  // Get all potions for backup
  const allPotions = db.prepare('SELECT * FROM user_potions').all();
  console.log('\n🗄️ Creating backup of current potions...');
  
  // Save backup
  const fs = require('fs');
  const backupPath = path.join(__dirname, `potion-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(allPotions, null, 2));
  console.log(`✅ Backup saved to: ${backupPath}`);
  
  // Delete all potions
  console.log('\n🗑️ Deleting all potions from database...');
  const deleteStmt = db.prepare('DELETE FROM user_potions');
  const result = deleteStmt.run();
  console.log(`✅ Deleted ${result.changes} potions from database`);
  
  // Verify deletion
  const afterDelete = db.prepare('SELECT COUNT(*) as count FROM user_potions').get();
  console.log(`\n✅ Verification: ${afterDelete.count} potions remaining (should be 0)`);
  
  db.close();
  
  console.log('\n🎯 Database potions wiped successfully!');
  console.log('\n⚠️  IMPORTANT: Now clear your browser localStorage:');
  console.log('1. Open your app in browser');
  console.log('2. Press F12 for Developer Tools');
  console.log('3. Go to Application tab → Local Storage');
  console.log('4. Right-click on your localhost entry and click "Clear"');
  console.log('5. Or run this in console: localStorage.clear()');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
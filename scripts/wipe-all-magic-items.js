const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/obojima.db');

console.log('🗑️  WIPE ALL MAGIC ITEMS');
console.log('='.repeat(50));
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if user_magic_items table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_magic_items'").get();
  
  if (!tableCheck) {
    console.log('✅ No user_magic_items table found - nothing to wipe');
    db.close();
    process.exit(0);
  }
  
  // Show current magic items before deletion
  console.log('\n📊 Current magic items in database:');
  const magicItems = db.prepare('SELECT * FROM user_magic_items').all();
  console.log(`Total magic items: ${magicItems.length}`);
  
  magicItems.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. "${data.name}" - ID: ${row.id}`);
    } catch (e) {
      console.log(`${index + 1}. [Invalid JSON] - ID: ${row.id}`);
    }
  });
  
  if (magicItems.length === 0) {
    console.log('✅ No magic items to delete');
    db.close();
    process.exit(0);
  }
  
  // Delete all magic items
  console.log('\n🗑️  Deleting all magic items...');
  const deleteResult = db.prepare('DELETE FROM user_magic_items').run();
  console.log(`✅ Deleted ${deleteResult.changes} magic items`);
  
  // Verify deletion
  const remainingMagicItems = db.prepare('SELECT COUNT(*) as count FROM user_magic_items').get();
  console.log(`Remaining magic items: ${remainingMagicItems.count}`);
  
  db.close();
  console.log('\n🎉 Magic items wipe complete!');
  console.log('Restart your app to see the clean state.');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('Connecting to database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Finding all rabbit potions...');
  
  // Get all rabbit potions using rowid for reliable deletion
  const stmt = db.prepare('SELECT rowid, * FROM user_potions WHERE data LIKE ?');
  const potions = stmt.all('%rabbit%');
  
  console.log(`Found ${potions.length} rabbit potions:`);
  
  potions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. ROWID: ${row.rowid}, Name: "${data.name}", Number: ${data.number}`);
    } catch (e) {
      console.log(`${index + 1}. ROWID: ${row.rowid}, Data: ${row.data.substring(0, 50)}...`);
    }
  });
  
  if (potions.length > 1) {
    console.log('\n🧹 Cleaning up duplicates...');
    
    // Keep only the first one, delete the rest using rowid
    const toDelete = potions.slice(1);
    const deleteStmt = db.prepare('DELETE FROM user_potions WHERE rowid = ?');
    
    toDelete.forEach(row => {
      try {
        const data = JSON.parse(row.data);
        console.log(`Deleting ROWID ${row.rowid}: "${data.name}"`);
        deleteStmt.run(row.rowid);
      } catch (e) {
        console.log(`Deleting ROWID ${row.rowid}`);
        deleteStmt.run(row.rowid);
      }
    });
    
    console.log(`✅ Deleted ${toDelete.length} duplicate potions`);
    
    // Verify cleanup
    const remaining = stmt.all('%rabbit%');
    console.log(`\n🎯 Remaining rabbit potions: ${remaining.length}`);
    remaining.forEach((row, index) => {
      try {
        const data = JSON.parse(row.data);
        console.log(`${index + 1}. "${data.name}" (Number: ${data.number})`);
      } catch (e) {
        console.log(`${index + 1}. ROWID: ${row.rowid}`);
      }
    });
    
  } else if (potions.length === 1) {
    console.log('✅ Only one rabbit potion found - no cleanup needed');
  } else {
    console.log('ℹ️ No rabbit potions found in database');
  }
  
  db.close();
  console.log('\n🎉 Cleanup complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.code === 'SQLITE_CANTOPEN') {
    console.log('\n💡 Database file not found. This might mean:');
    console.log('1. The app hasn\'t created the database yet (run the app first)');
    console.log('2. The database is in a different location');
    console.log('3. You\'re in demo mode (no database used)');
  }
}
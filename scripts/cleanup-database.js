const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('Connecting to database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Checking for Rabbit\'s Speed duplicates in database...');
  
  // Check user_potions table for duplicates
  const stmt = db.prepare('SELECT * FROM user_potions WHERE data LIKE ?');
  const potions = stmt.all('%rabbit%speed%');
  
  console.log('Found potions with "rabbit" and "speed":', potions.length);
  
  potions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. ID: ${row.id}, Name: "${data.name}", Number: ${data.number}`);
    } catch (e) {
      console.log(`${index + 1}. ID: ${row.id}, Data: ${row.data.substring(0, 50)}...`);
    }
  });
  
  if (potions.length > 1) {
    console.log('\n🧹 Multiple Rabbit\'s Speed potions found. Cleaning up...');
    
    // Keep only the first one, delete the rest
    const toDelete = potions.slice(1); // Skip the first one
    const deleteStmt = db.prepare('DELETE FROM user_potions WHERE id = ?');
    
    toDelete.forEach(row => {
      try {
        const data = JSON.parse(row.data);
        console.log(`Deleting: "${data.name}" (ID: ${row.id})`);
        deleteStmt.run(row.id);
      } catch (e) {
        console.log(`Deleting: ID ${row.id}`);
        deleteStmt.run(row.id);
      }
    });
    
    console.log(`✅ Deleted ${toDelete.length} duplicate potions`);
  } else if (potions.length === 1) {
    console.log('✅ Only one Rabbit\'s Speed potion found - no cleanup needed');
  } else {
    console.log('ℹ️ No Rabbit\'s Speed potions found in database');
  }
  
  // Also check other tables
  const tables = ['characters', 'sessions', 'quests', 'encounters', 'npcs'];
  tables.forEach(table => {
    try {
      const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
      const result = checkStmt.get();
      console.log(`Table ${table}: ${result.count} records`);
    } catch (e) {
      console.log(`Table ${table}: doesn't exist or error`);
    }
  });
  
  db.close();
  console.log('\n🎉 Database cleanup complete!');
  
} catch (error) {
  console.error('Error:', error.message);
  
  if (error.code === 'SQLITE_CANTOPEN') {
    console.log('\n💡 Database file not found. This might mean:');
    console.log('1. The app hasn\'t created the database yet (run the app first)');
    console.log('2. The database is in a different location');
    console.log('3. You\'re in demo mode (no database used)');
  }
}
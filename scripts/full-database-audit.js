const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('Connecting to database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('🔍 FULL DATABASE AUDIT');
  console.log('='.repeat(60));
  
  // Get the actual SQL schema
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='user_potions'").get();
  console.log('Table schema:');
  console.log(schema ? schema.sql : 'Table not found');
  console.log('-'.repeat(60));
  
  // Get ALL rows with ALL columns
  const stmt = db.prepare('SELECT *, rowid FROM user_potions');
  const allRows = stmt.all();
  
  console.log(`\nTotal rows in user_potions: ${allRows.length}`);
  console.log('-'.repeat(60));
  
  allRows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    console.log(`  ROWID: ${row.rowid}`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Data length: ${row.data ? row.data.length : 'null'} characters`);
    
    try {
      const data = JSON.parse(row.data);
      console.log(`  Name: "${data.name}"`);
      console.log(`  Number: ${data.number}`);
      console.log(`  Type: ${data.type || 'undefined'}`);
      console.log(`  Image: ${data.imageUrl || 'undefined'}`);
      
      // Check if it's a rabbit potion
      if (data.name && data.name.toLowerCase().includes('rabbit')) {
        console.log(`  🐰 RABBIT POTION DETECTED!`);
      }
      
    } catch (e) {
      console.log(`  ❌ Invalid JSON: ${e.message}`);
      console.log(`  Raw data: ${row.data.substring(0, 100)}...`);
    }
  });
  
  // Check for any constraints or indexes
  const indexes = db.prepare("SELECT * FROM sqlite_master WHERE type='index' AND tbl_name='user_potions'").all();
  if (indexes.length > 0) {
    console.log('\n📋 Indexes:');
    indexes.forEach(idx => console.log(`  ${idx.name}: ${idx.sql}`));
  }
  
  // Check if there are any triggers
  const triggers = db.prepare("SELECT * FROM sqlite_master WHERE type='trigger' AND tbl_name='user_potions'").all();
  if (triggers.length > 0) {
    console.log('\n⚡ Triggers:');
    triggers.forEach(trigger => console.log(`  ${trigger.name}: ${trigger.sql}`));
  }
  
  db.close();
  console.log('\n🎉 Audit complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
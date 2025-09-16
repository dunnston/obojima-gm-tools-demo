const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('📊 Database inspection:');
  console.log('='.repeat(50));
  
  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables found:', tables.map(t => t.name).join(', '));
  
  // Check user_potions table specifically
  if (tables.some(t => t.name === 'user_potions')) {
    console.log('\n🧪 User Potions:');
    console.log('-'.repeat(30));
    
    const allPotions = db.prepare('SELECT * FROM user_potions').all();
    console.log(`Total user potions: ${allPotions.length}`);
    
    allPotions.forEach((row, index) => {
      try {
        const data = JSON.parse(row.data);
        console.log(`${index + 1}. "${data.name}" (Number: ${data.number}) - ID: ${row.id}`);
        
        if (data.name && data.name.toLowerCase().includes('rabbit')) {
          console.log(`   ⭐ RABBIT POTION FOUND: "${data.name}"`);
        }
      } catch (e) {
        console.log(`${index + 1}. [Invalid JSON] ID: ${row.id}`);
      }
    });
  } else {
    console.log('❌ No user_potions table found');
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.code === 'SQLITE_CANTOPEN') {
    console.log('\n💡 Possible reasons:');
    console.log('- Database file doesn\'t exist yet (app not run)'); 
    console.log('- Wrong path');
    console.log('- Running in demo mode');
  }
}
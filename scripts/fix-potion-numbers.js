const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('Connecting to database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Analyzing all user potions...');
  
  // Get all user potions
  const stmt = db.prepare('SELECT rowid, * FROM user_potions ORDER BY rowid');
  const allPotions = stmt.all();
  
  console.log(`Found ${allPotions.length} total potions:`);
  
  // Track which numbers are already used
  const usedNumbers = new Set();
  const potionsToUpdate = [];
  
  allPotions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. ROWID: ${row.rowid}, Name: "${data.name}", Number: ${data.number}`);
      
      if (usedNumbers.has(data.number)) {
        console.log(`   ⚠️  DUPLICATE NUMBER DETECTED: ${data.number}`);
        potionsToUpdate.push({ rowid: row.rowid, data: data, originalData: row.data });
      } else {
        usedNumbers.add(data.number);
      }
    } catch (e) {
      console.log(`${index + 1}. ROWID: ${row.rowid}, [Invalid JSON]`);
    }
  });
  
  if (potionsToUpdate.length > 0) {
    console.log(`\n🔧 Fixing ${potionsToUpdate.length} potions with duplicate numbers...`);
    
    // Find the next available number
    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }
    
    const updateStmt = db.prepare('UPDATE user_potions SET data = ? WHERE rowid = ?');
    
    potionsToUpdate.forEach(potion => {
      const newData = { ...potion.data, number: nextNumber };
      const newDataJson = JSON.stringify(newData);
      
      console.log(`Updating "${potion.data.name}" from number ${potion.data.number} to ${nextNumber}`);
      updateStmt.run(newDataJson, potion.rowid);
      
      usedNumbers.add(nextNumber);
      nextNumber++;
    });
    
    console.log('✅ Fixed potion numbering!');
    
    // Verify the fix
    console.log('\n🎯 Verification - All potions after fix:');
    const verifyStmt = db.prepare('SELECT rowid, * FROM user_potions ORDER BY rowid');
    const verifyPotions = verifyStmt.all();
    
    verifyPotions.forEach((row, index) => {
      try {
        const data = JSON.parse(row.data);
        console.log(`${index + 1}. "${data.name}" (Number: ${data.number})`);
      } catch (e) {
        console.log(`${index + 1}. ROWID: ${row.rowid}, [Invalid JSON]`);
      }
    });
    
  } else {
    console.log('✅ No duplicate numbers found - all potions have unique numbers');
  }
  
  db.close();
  console.log('\n🎉 Number fixing complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.code === 'SQLITE_CANTOPEN') {
    console.log('\n💡 Database file not found. This might mean:');
    console.log('1. The app hasn\'t created the database yet (run the app first)');
    console.log('2. The database is in a different location');
    console.log('3. You\'re in demo mode (no database used)');
  }
}
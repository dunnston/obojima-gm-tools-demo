const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('🔧 FIX POTION IDS SCRIPT');
console.log('='.repeat(60));
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check current state
  console.log('\n📊 Current database state:');
  const potions = db.prepare('SELECT rowid, * FROM user_potions').all();
  console.log(`Total potions: ${potions.length}`);
  
  console.log('\n🔍 Analyzing potions:');
  potions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. ROWID: ${row.rowid}, ID: ${row.id}, Name: "${data.name}", Number: ${data.number}`);
    } catch (e) {
      console.log(`${index + 1}. ROWID: ${row.rowid}, ID: ${row.id}, [Invalid JSON]`);
    }
  });
  
  // Fix IDs
  console.log('\n🔧 Fixing potion IDs...');
  const updateStmt = db.prepare('UPDATE user_potions SET id = ? WHERE rowid = ?');
  
  // Group potions by number to handle duplicates
  const potionsByNumber = {};
  potions.forEach(row => {
    try {
      const data = JSON.parse(row.data);
      if (!potionsByNumber[data.number]) {
        potionsByNumber[data.number] = [];
      }
      potionsByNumber[data.number].push({ ...row, parsedData: data });
    } catch (e) {
      console.error('Error parsing potion:', e);
    }
  });
  
  // Process each group
  Object.keys(potionsByNumber).forEach(number => {
    const group = potionsByNumber[number];
    
    if (group.length > 1) {
      console.log(`\n⚠️  Found ${group.length} potions with number ${number}:`);
      group.forEach((potion, idx) => {
        console.log(`   ${idx + 1}. "${potion.parsedData.name}" (ROWID: ${potion.rowid})`);
      });
      
      // Keep the most recent one (highest rowid)
      const sortedByRowId = group.sort((a, b) => b.rowid - a.rowid);
      const keepPotion = sortedByRowId[0];
      const deletePotion = sortedByRowId.slice(1);
      
      console.log(`   ✅ Keeping: "${keepPotion.parsedData.name}" (ROWID: ${keepPotion.rowid})`);
      
      // Delete duplicates
      const deleteStmt = db.prepare('DELETE FROM user_potions WHERE rowid = ?');
      deletePotion.forEach(potion => {
        console.log(`   🗑️ Deleting: "${potion.parsedData.name}" (ROWID: ${potion.rowid})`);
        deleteStmt.run(potion.rowid);
      });
      
      // Update ID for the kept potion
      const newId = `potion-${number}`;
      console.log(`   📝 Setting ID to: ${newId}`);
      updateStmt.run(newId, keepPotion.rowid);
      
    } else if (group.length === 1) {
      // Single potion, just update its ID
      const potion = group[0];
      const newId = `potion-${number}`;
      console.log(`\n✅ Potion "${potion.parsedData.name}" (Number: ${number})`);
      console.log(`   📝 Setting ID to: ${newId}`);
      updateStmt.run(newId, potion.rowid);
    }
  });
  
  // Verify the fix
  console.log('\n🎯 Verification:');
  const fixedPotions = db.prepare('SELECT * FROM user_potions').all();
  console.log(`Total potions after fix: ${fixedPotions.length}`);
  
  fixedPotions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. ID: ${row.id}, Name: "${data.name}", Number: ${data.number}`);
    } catch (e) {
      console.log(`${index + 1}. ID: ${row.id}, [Invalid JSON]`);
    }
  });
  
  db.close();
  console.log('\n🎉 Potion IDs fixed successfully!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
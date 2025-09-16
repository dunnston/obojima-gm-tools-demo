const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/obojima.db');

console.log('🔍 DEBUG MAGIC ITEMS STATE');
console.log('='.repeat(50));

try {
  const db = new Database(dbPath);
  
  // Check if user_magic_items table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_magic_items'").get();
  
  if (!tableCheck) {
    console.log('✅ No user_magic_items table found - clean state');
    db.close();
    process.exit(0);
  }
  
  // Show current magic items in database
  console.log('\n📊 Current magic items in database:');
  const magicItems = db.prepare('SELECT * FROM user_magic_items').all();
  console.log(`Total magic items: ${magicItems.length}`);
  
  if (magicItems.length === 0) {
    console.log('✅ No magic items in database - clean state');
  } else {
    magicItems.forEach((row, index) => {
      try {
        const data = JSON.parse(row.data);
        console.log(`${index + 1}. "${data.name}" - DB ID: ${row.id}, Item ID: ${data.id || 'MISSING'}`);
        
        if (data.name.includes('Anglerfish')) {
          console.log(`   🎯 ANGLERFISH ITEM: "${data.name}" - DB ID: ${row.id}, Item ID: ${data.id || 'MISSING'}`);
          console.log(`      Original name was likely: "Anglerfish Helm"`);
          console.log(`      Expected ID should be: magic-item-anglerfish-helm`);
        }
      } catch (e) {
        console.log(`${index + 1}. [Invalid JSON] - DB ID: ${row.id}`);
      }
    });
  }
  
  db.close();
  
  // Also check what the original magic items from data file would have
  console.log('\n📄 Original magic items from data file:');
  const { magicItems: originalMagicItems } = require('../src/data/magicItems.ts');
  
  const anglerfish = originalMagicItems.find(item => item.name === 'Anglerfish Helm');
  if (anglerfish) {
    const expectedId = `magic-item-${anglerfish.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    console.log(`Anglerfish Helm from data file:`);
    console.log(`  Name: "${anglerfish.name}"`);
    console.log(`  Expected ID: ${expectedId}`);
    console.log(`  Has ID field: ${anglerfish.id || 'NO'}`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
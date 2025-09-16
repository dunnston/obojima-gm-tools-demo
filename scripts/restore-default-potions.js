const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('🔄 RESTORE DEFAULT POTIONS SCRIPT');
console.log('='.repeat(60));
console.log('Database path:', dbPath);

// Default potions to restore
const defaultPotions = [
  {
    id: 'potion-1',
    number: 1,
    name: "Rabbit's Speed",
    rarity: "Common",
    category: "Combat",
    description: "Grants the drinker enhanced speed and agility, as if they had the swiftness of a rabbit.",
    effect: "The drinker's speed increases by 10 feet for 1 hour.",
    value: 50,
    ingredients: ["Rabbit's Foot", "Spring Water"],
    craftingTime: "30 minutes",
    imageUrl: "https://drive.google.com/uc?export=view&id=1WSuGeDo8Vrb4JeejSzDGHS7g6f6rSSEt"
  }
];

try {
  const db = new Database(dbPath);
  
  // Check current state
  console.log('\n📊 Current database state:');
  const currentPotions = db.prepare('SELECT COUNT(*) as count FROM user_potions').get();
  console.log(`Total potions in database: ${currentPotions.count}`);
  
  if (currentPotions.count > 0) {
    console.log('\n⚠️  WARNING: Database still contains potions!');
    console.log('Run wipe-all-potions.js first to clear the database.');
    process.exit(1);
  }
  
  // Insert default potions
  console.log('\n📝 Restoring default potions...');
  const insertStmt = db.prepare('INSERT INTO user_potions (id, data) VALUES (?, ?)');
  
  defaultPotions.forEach((potion, index) => {
    try {
      const data = JSON.stringify(potion);
      insertStmt.run(potion.id, data);
      console.log(`✅ Restored: "${potion.name}" (Number: ${potion.number})`);
    } catch (error) {
      console.error(`❌ Error restoring potion ${index + 1}:`, error.message);
    }
  });
  
  // Verify restoration
  const afterRestore = db.prepare('SELECT COUNT(*) as count FROM user_potions').get();
  console.log(`\n✅ Verification: ${afterRestore.count} potions in database`);
  
  // Show what was restored
  const restoredPotions = db.prepare('SELECT * FROM user_potions').all();
  console.log('\n📋 Restored potions:');
  restoredPotions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. "${data.name}" (Number: ${data.number}, ID: ${row.id})`);
    } catch (e) {
      console.log(`${index + 1}. ID: ${row.id} [Invalid JSON]`);
    }
  });
  
  db.close();
  
  console.log('\n🎯 Default potions restored successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Clear your browser cache and localStorage');
  console.log('2. Restart your app');
  console.log('3. You should see only 1 "Rabbit\'s Speed" potion');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
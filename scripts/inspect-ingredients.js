const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/obojima.db');
const db = new Database(dbPath);

console.log('🧪 User Ingredients:');
console.log('-'.repeat(30));

try {
  const ingredients = db.prepare('SELECT * FROM user_ingredients').all();
  console.log(`Total user ingredients: ${ingredients.length}`);

  ingredients.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      console.log(`${index + 1}. "${data.name}" - ID: ${row.id}`);
      if (data.name && data.name.toLowerCase().includes('amber')) {
        console.log(`   ⭐ AMBER INGREDIENT FOUND: "${data.name}"`);
      }
    } catch (e) {
      console.log(`${index + 1}. [Invalid JSON] - ID: ${row.id}`);
    }
  });
} catch (error) {
  console.log('❌ No user_ingredients table or error:', error.message);
}

db.close();
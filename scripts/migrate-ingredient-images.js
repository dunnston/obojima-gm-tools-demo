// Script to migrate ingredient images to use local paths instead of Google Drive URLs
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('🔄 MIGRATE INGREDIENT IMAGES SCRIPT');
console.log('='.repeat(60));
console.log('Database path:', dbPath);

// Check if public/images/ingredients directory exists
const ingredientsDir = path.join(__dirname, '../public/images/ingredients');
if (!fs.existsSync(ingredientsDir)) {
  console.error('❌ Ingredients images directory not found:', ingredientsDir);
  console.log('Please ensure the directory exists with your ingredient images.');
  process.exit(1);
}

// List available ingredient images
const availableImages = fs.readdirSync(ingredientsDir)
  .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  .map(file => ({
    filename: file,
    nameWithoutExt: path.parse(file).name,
    ext: path.parse(file).ext
  }));

console.log(`📁 Found ${availableImages.length} ingredient images in ${ingredientsDir}`);

// Function to find best matching image for an ingredient name
function findBestImageMatch(ingredientName) {
  const searchName = ingredientName.toLowerCase();
  
  // Try exact match first (with spaces)
  let match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase() === searchName
  );
  
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Try normalized match (with dashes)
  const normalizedName = searchName.replace(/[^a-z0-9]/g, '-');
  match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase() === normalizedName
  );
  
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Try partial matches
  match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase().includes(searchName) ||
    searchName.includes(img.nameWithoutExt.toLowerCase())
  );
  
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Default fallback
  return '/images/ingredients/default-ingredient.svg';
}

try {
  const db = new Database(dbPath);
  
  // Get all user ingredients
  console.log('\n📊 Checking database ingredients...');
  const ingredients = db.prepare('SELECT * FROM user_ingredients').all();
  console.log(`Found ${ingredients.length} ingredients in database`);
  
  if (ingredients.length === 0) {
    console.log('✅ No ingredients to migrate');
    db.close();
    process.exit(0);
  }
  
  // Process each ingredient
  const updateStmt = db.prepare('UPDATE user_ingredients SET data = ? WHERE id = ?');
  let updated = 0;
  
  ingredients.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      const ingredientName = data.name;
      
      // Skip if already has a local image path
      if (data.imageUrl && data.imageUrl.startsWith('/images/ingredients/')) {
        console.log(`${index + 1}. "${ingredientName}" - Already has local image: ${data.imageUrl}`);
        return;
      }
      
      // Find best matching image
      const newImageUrl = findBestImageMatch(ingredientName);
      
      // Update the ingredient data
      const updatedData = {
        ...data,
        imageUrl: newImageUrl
      };
      
      updateStmt.run(JSON.stringify(updatedData), row.id);
      updated++;
      
      console.log(`${index + 1}. "${ingredientName}" -> ${newImageUrl}`);
      
    } catch (e) {
      console.error(`Error processing ingredient ${row.id}:`, e.message);
    }
  });
  
  console.log(`\n✅ Updated ${updated} ingredients with local image paths`);
  
  db.close();
  console.log('\n🎉 Migration complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
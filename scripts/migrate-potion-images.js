// Script to migrate potion images to use local paths instead of Google Drive URLs
const fs = require('fs');
const path = require('path');

const Database = require('better-sqlite3');

// Connect to the database
const dbPath = path.join(__dirname, '../data/obojima.db');
console.log('🔄 MIGRATE POTION IMAGES SCRIPT');
console.log('='.repeat(60));
console.log('Database path:', dbPath);

// Check if public/images/potions directory exists
const potionsDir = path.join(__dirname, '../public/images/potions');
if (!fs.existsSync(potionsDir)) {
  console.error('❌ Potions images directory not found:', potionsDir);
  console.log('Please ensure the directory exists with your potion images.');
  process.exit(1);
}

// List available potion images
const availableImages = fs.readdirSync(potionsDir)
  .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  .map(file => ({
    filename: file,
    nameWithoutExt: path.parse(file).name,
    ext: path.parse(file).ext
  }));

console.log(`📁 Found ${availableImages.length} potion images in ${potionsDir}`);

// Function to find best matching image for a potion name
function findBestImageMatch(potionName) {
  const searchName = potionName.toLowerCase();
  
  // Try exact match first (with spaces)
  let match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase() === searchName
  );
  
  if (match) return `/images/potions/${match.filename}`;
  
  // Try normalized match (with dashes)
  const normalizedName = searchName.replace(/[^a-z0-9]/g, '-');
  match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase() === normalizedName
  );
  
  if (match) return `/images/potions/${match.filename}`;
  
  // Try partial matches
  match = availableImages.find(img => 
    img.nameWithoutExt.toLowerCase().includes(searchName) ||
    searchName.includes(img.nameWithoutExt.toLowerCase())
  );
  
  if (match) return `/images/potions/${match.filename}`;
  
  // Default fallback
  return '/images/potions/default-potion.svg';
}

try {
  const db = new Database(dbPath);
  
  // Get all user potions
  console.log('\n📊 Checking database potions...');
  const potions = db.prepare('SELECT * FROM user_potions').all();
  console.log(`Found ${potions.length} potions in database`);
  
  if (potions.length === 0) {
    console.log('✅ No potions to migrate');
    db.close();
    process.exit(0);
  }
  
  // Process each potion
  const updateStmt = db.prepare('UPDATE user_potions SET data = ? WHERE id = ?');
  let updated = 0;
  
  potions.forEach((row, index) => {
    try {
      const data = JSON.parse(row.data);
      const potionName = data.name;
      
      // Skip if already has a local image path
      if (data.imageUrl && data.imageUrl.startsWith('/images/potions/')) {
        console.log(`${index + 1}. "${potionName}" - Already has local image: ${data.imageUrl}`);
        return;
      }
      
      // Find best matching image
      const newImageUrl = findBestImageMatch(potionName);
      
      // Update the potion data
      const updatedData = {
        ...data,
        imageUrl: newImageUrl
      };
      
      updateStmt.run(JSON.stringify(updatedData), row.id);
      updated++;
      
      console.log(`${index + 1}. "${potionName}" -> ${newImageUrl}`);
      
    } catch (e) {
      console.error(`Error processing potion ${row.id}:`, e.message);
    }
  });
  
  console.log(`\n✅ Updated ${updated} potions with local image paths`);
  
  // Show summary of unmatched potions
  console.log('\n📋 Image matching summary:');
  const afterPotions = db.prepare('SELECT * FROM user_potions').all();
  const unmatchedCount = afterPotions.filter(row => {
    try {
      const data = JSON.parse(row.data);
      return data.imageUrl === '/images/potions/default-potion.svg';
    } catch (e) {
      return false;
    }
  }).length;
  
  console.log(`- Matched with specific images: ${updated - unmatchedCount}`);
  console.log(`- Using default image: ${unmatchedCount}`);
  
  db.close();
  console.log('\n🎉 Migration complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
// Script to fix ingredient image paths to match available files
const fs = require('fs');
const path = require('path');

const ingredientsDir = path.join(__dirname, '../public/images/ingredients');
console.log('🔧 FIX INGREDIENT IMAGE PATHS');
console.log('='.repeat(50));

// Get all available ingredient images
const availableImages = fs.readdirSync(ingredientsDir)
  .filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i))
  .map(file => ({
    filename: file,
    nameWithoutExt: path.parse(file).name.toLowerCase(),
    originalName: path.parse(file).name
  }));

console.log(`📁 Found ${availableImages.length} ingredient images`);

// Test ingredients from the data file
const testIngredients = [
  'Amber',
  'Apper Carrot', 
  'Bamboo',
  'Bashu Powder',
  'Black Cinnamon',
  'Black Pearl',
  'Blossom of Spirit Vine'
];

console.log('\n🧪 Testing ingredient image matching:');

function findBestImageMatch(ingredientName) {
  const searchName = ingredientName.toLowerCase();
  const searchNameNormalized = searchName.replace(/[^a-z0-9]/g, '');
  
  // Try exact match with lowercase
  let match = availableImages.find(img => img.nameWithoutExt === searchName);
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Try exact match with original case
  match = availableImages.find(img => img.originalName.toLowerCase() === searchName);
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Try normalized match (no spaces/special chars)
  match = availableImages.find(img => 
    img.nameWithoutExt.replace(/[^a-z0-9]/g, '') === searchNameNormalized
  );
  if (match) return `/images/ingredients/${match.filename}`;
  
  // Try partial matches
  match = availableImages.find(img => 
    img.nameWithoutExt.includes(searchName) ||
    searchName.includes(img.nameWithoutExt)
  );
  if (match) return `/images/ingredients/${match.filename}`;
  
  return '/images/ingredients/default-ingredient.svg';
}

testIngredients.forEach(ingredient => {
  const imagePath = findBestImageMatch(ingredient);
  const found = imagePath !== '/images/ingredients/default-ingredient.svg';
  console.log(`  ${ingredient}: ${found ? '✅' : '❌'} ${imagePath}`);
});

// Generate the improved mapping code
console.log('\n📝 Improved image path logic:');
console.log('Replace the ingredient imageUrl assignment with this logic:');
console.log(`
function getIngredientImagePath(ingredientName) {
  const searchName = ingredientName.toLowerCase();
  const searchNameNormalized = searchName.replace(/[^a-z0-9]/g, '');
  
  // Common patterns in ingredient image filenames
  const patterns = [
    ingredientName,                    // Original case: "Black Cinnamon"
    ingredientName.toLowerCase(),      // Lowercase: "black cinnamon"  
    searchNameNormalized,              // No spaces: "blackcinnamon"
    ingredientName.toLowerCase().replace(/[^a-z0-9]/g, '-')  // Dashes: "black-cinnamon"
  ];
  
  for (const pattern of patterns) {
    // Try with .webp extension first
    const webpPath = \`/images/ingredients/\${pattern}.webp\`;
    // Note: In real implementation, you'd check file existence
    // For now, we'll use the pattern that matches your file structure
  }
  
  return '/images/ingredients/default-ingredient.svg';
}
`);
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Read the CSV file
const csvPath = path.join(__dirname, '../../Weavers Csvs/Copy of Weaver\'s Obojima Ingredients and Potions - Ingredients.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = csv.parse(csvContent, {
  columns: false,
  skip_empty_lines: true,
  from_line: 2 // Skip header
});

// Create a mapping of ingredient names to types
const ingredientTypes = {};

records.forEach(row => {
  const name = row[2]; // Column 3 is the ingredient name
  const type = row[8]; // Column 9 is the type
  
  if (name && type && type.trim() !== '') {
    // Normalize the type (remove trailing space from "Monster ")
    const normalizedType = type.trim();
    ingredientTypes[name] = normalizedType;
  }
});

// Read the current ingredients.ts file
const ingredientsPath = path.join(__dirname, '../src/data/ingredients.ts');
let ingredientsContent = fs.readFileSync(ingredientsPath, 'utf-8');

// Function to add type to ingredient
function addTypeToIngredient(content, ingredientName, type) {
  // Find the ingredient object
  const namePattern = new RegExp(`name:\\s*"${ingredientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
  const matches = [...content.matchAll(namePattern)];
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const startIndex = match.index;
      
      // Find the next closing brace for this ingredient
      let braceCount = 0;
      let foundStart = false;
      let endIndex = startIndex;
      
      for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
          foundStart = true;
        } else if (content[i] === '}' && foundStart) {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      // Check if type already exists
      const ingredientBlock = content.substring(startIndex, endIndex);
      if (!ingredientBlock.includes('type:')) {
        // Find where to insert the type (after rarity)
        const rarityMatch = ingredientBlock.match(/rarity:\s*"[^"]+",?\s*\n/);
        if (rarityMatch) {
          const insertPosition = startIndex + rarityMatch.index + rarityMatch[0].length;
          const indentation = '    '; // 4 spaces
          const typeString = `${indentation}type: "${type}",\n`;
          
          content = content.slice(0, insertPosition) + typeString + content.slice(insertPosition);
        }
      }
    });
  }
  
  return content;
}

// Process each ingredient
let updatedContent = ingredientsContent;
let updateCount = 0;

for (const [name, type] of Object.entries(ingredientTypes)) {
  const beforeLength = updatedContent.length;
  updatedContent = addTypeToIngredient(updatedContent, name, type);
  if (updatedContent.length !== beforeLength) {
    updateCount++;
    console.log(`✅ Added type "${type}" to ${name}`);
  }
}

// Write the updated content back
fs.writeFileSync(ingredientsPath, updatedContent);

console.log(`\n🎉 Successfully updated ${updateCount} ingredients with types!`);
console.log(`📊 Total ingredient types found in CSV: ${Object.keys(ingredientTypes).length}`);

// Log any ingredients that might not have been found
const ingredientNamesInFile = [...updatedContent.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1]);
const csvIngredientNames = Object.keys(ingredientTypes);

const missingInFile = csvIngredientNames.filter(name => !ingredientNamesInFile.includes(name));
if (missingInFile.length > 0) {
  console.log('\n⚠️  Ingredients in CSV but not in ingredients.ts:');
  missingInFile.forEach(name => console.log(`   - ${name} (${ingredientTypes[name]})`));
}
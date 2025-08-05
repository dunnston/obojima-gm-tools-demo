const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Read CSV files
const potionsCSV = fs.readFileSync(path.join(__dirname, '../../French/Copie de Weaver\'s Obojima Ingredients and Potions - Potions.csv'), 'utf-8');
const ingredientsCSV = fs.readFileSync(path.join(__dirname, '../../French/Copie de Weaver\'s Obojima Ingredients and Potions - Ingredients.csv'), 'utf-8');

// Parse CSV files
const potionsData = csv.parse(potionsCSV, { columns: false, skip_empty_lines: true });
const ingredientsData = csv.parse(ingredientsCSV, { columns: false, skip_empty_lines: true });

// Extract translations
const potionTranslations = {};
const ingredientTranslations = {};

// Process potions (skip header row)
for (let i = 1; i < potionsData.length; i++) {
  const row = potionsData[i];
  const englishName = row[3]; // Column D
  const frenchName = row[4];  // Column E
  
  if (englishName && frenchName && englishName !== 'Potion' && frenchName !== '') {
    potionTranslations[englishName] = frenchName;
  }
}

// Process ingredients (skip header row)
for (let i = 1; i < ingredientsData.length; i++) {
  const row = ingredientsData[i];
  const englishName = row[2]; // Column C
  const frenchName = row[3];  // Column D
  
  if (englishName && frenchName && englishName !== 'Ingredient' && frenchName !== 'French') {
    ingredientTranslations[englishName] = frenchName;
  }
}

// Read existing French translation file
const frenchTranslationPath = path.join(__dirname, '../public/locales/fr/common.json');
const existingTranslations = JSON.parse(fs.readFileSync(frenchTranslationPath, 'utf-8'));

// Add new translations
existingTranslations.potions.names = potionTranslations;
existingTranslations.ingredients.names = ingredientTranslations;

// Write updated translations
fs.writeFileSync(frenchTranslationPath, JSON.stringify(existingTranslations, null, 2));

console.log(`Added ${Object.keys(potionTranslations).length} potion translations`);
console.log(`Added ${Object.keys(ingredientTranslations).length} ingredient translations`);
console.log('French translations updated successfully!');
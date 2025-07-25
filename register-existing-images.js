const fs = require('fs');
const path = require('path');

// Function to scan directory and get all image files
function getImageFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  
  return fs.readdirSync(directory)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.webp', '.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    })
    .map(file => {
      const nameWithoutExt = path.basename(file, path.extname(file));
      return {
        originalName: nameWithoutExt,
        fileName: file,
        extension: path.extname(file).substring(1) // Remove the dot
      };
    });
}

// Function to generate the registration code for imageMapping.ts
function generateRegistrationCode() {
  const baseDir = path.join(__dirname, 'public', 'images');
  
  const ingredients = getImageFiles(path.join(baseDir, 'ingredients'));
  const potions = getImageFiles(path.join(baseDir, 'potions'));
  const creatures = getImageFiles(path.join(baseDir, 'creatures'));
  
  console.log('🔍 Found existing images:');
  console.log(`  - ${ingredients.length} ingredient images`);
  console.log(`  - ${potions.length} potion images`);
  console.log(`  - ${creatures.length} creature images`);
  
  let registrationCode = '\n// Auto-generated registration for existing files\n';
  
  // Register ingredients
  registrationCode += '// Ingredients\n';
  ingredients.forEach(item => {
    if (item.originalName !== 'default-ingredient') {
      registrationCode += `addLocalIngredientFile('${item.originalName}', '${item.extension}');\n`;
      registrationCode += `localIngredientFiles.add('${item.fileName}'); // Direct filename\n`;
    }
  });
  
  // Register potions
  registrationCode += '\n// Potions\n';
  potions.forEach(item => {
    if (item.originalName !== 'default-potion') {
      registrationCode += `addLocalPotionFile('${item.originalName}', '${item.extension}');\n`;
      registrationCode += `localPotionFiles.add('${item.fileName}'); // Direct filename\n`;
    }
  });
  
  // Register creatures
  registrationCode += '\n// Creatures\n';
  creatures.forEach(item => {
    if (item.originalName !== 'default-creature') {
      registrationCode += `addLocalCreatureFile('${item.originalName}', '${item.extension}');\n`;
      registrationCode += `localCreatureFiles.add('${item.fileName}'); // Direct filename\n`;
    }
  });
  
  console.log('\n📝 Generated registration code:');
  console.log(registrationCode);
  
  // Write to a separate file for easy copying
  fs.writeFileSync(path.join(__dirname, 'image-registration.txt'), registrationCode);
  console.log('\n💾 Saved registration code to image-registration.txt');
  
  return registrationCode;
}

// Run the function
generateRegistrationCode();
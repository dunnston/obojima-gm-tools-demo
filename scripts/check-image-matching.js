const fs = require('fs');
const path = require('path');

const potionsDir = path.join(__dirname, '../public/images/potions');
const images = fs.readdirSync(potionsDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));

console.log('🔍 CHECKING IMAGE MATCHING');
console.log('='.repeat(50));

// Check specific problematic potions
const problemPotions = ['Beast Hide', 'Spirit Armor', "Shepherd's Bane"];

problemPotions.forEach(name => {
  console.log(`Looking for: "${name}"`);
  
  // Check exact match
  const exactMatch = images.find(img => {
    const nameWithoutExt = path.parse(img).name;
    return nameWithoutExt === name;
  });
  
  if (exactMatch) {
    console.log(`  ✅ Exact match: ${exactMatch}`);
  } else {
    console.log(`  ❌ No exact match`);
    
    // Show similar names
    const searchTerm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const similar = images.filter(img => {
      const imgName = path.parse(img).name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return imgName.includes(searchTerm) || searchTerm.includes(imgName);
    });
    
    if (similar.length > 0) {
      console.log(`  🔍 Similar: ${similar.join(', ')}`);
    }
  }
  console.log('');
});

// Now check all images that might have apostrophe issues
console.log('📝 Images with apostrophes or special characters:');
const specialChars = images.filter(img => img.includes("'") || img.includes('"') || img.includes('&'));
specialChars.forEach(img => {
  console.log(`  ${img}`);
});

// Check a few combat potions that should exist
console.log('\n🗡️ Checking first few combat potions:');
const combatPotions = [
  "Rabbit's Speed",
  "Weapon Master's Elixir", 
  "Spirit of Salyri",
  "Beast Hide",
  "Spirit Armor",
  "Displacement Field",
  "Shepherd's Bane"
];

combatPotions.forEach(name => {
  const exactMatch = images.find(img => path.parse(img).name === name);
  console.log(`  ${name}: ${exactMatch ? '✅ ' + exactMatch : '❌ Missing'}`);
});
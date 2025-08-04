// Script to clean up duplicate Rabbit's Speed potions
console.log('🧹 Cleaning up Rabbit\'s Speed potions...');

// Check localStorage first
const modifiedPotions = localStorage.getItem('modifiedPotions');
if (modifiedPotions) {
  try {
    const potions = JSON.parse(modifiedPotions);
    console.log('Found modified potions in localStorage:', potions.length);
    
    // Find Rabbit's Speed related potions
    const rabbitPotions = potions.filter(p => 
      p.name.toLowerCase().includes('rabbit') && 
      p.name.toLowerCase().includes('speed')
    );
    
    console.log('Rabbit Speed potions found:', rabbitPotions);
    
    if (rabbitPotions.length > 0) {
      // Remove all Rabbit's Speed modifications (this will restore the original)
      const cleanedPotions = potions.filter(p => 
        !(p.name.toLowerCase().includes('rabbit') && p.name.toLowerCase().includes('speed'))
      );
      
      localStorage.setItem('modifiedPotions', JSON.stringify(cleanedPotions));
      console.log('✅ Cleaned up localStorage - removed', rabbitPotions.length, 'Rabbit Speed potions');
    } else {
      console.log('No Rabbit Speed potions found in localStorage');
    }
  } catch (error) {
    console.error('Error parsing localStorage:', error);
  }
} else {
  console.log('No modified potions found in localStorage');
}

// Check sync service storage
const keys = Object.keys(localStorage);
const syncKeys = keys.filter(key => key.startsWith('obojima-demo-') || key.includes('potion'));

console.log('Other potential storage keys:', syncKeys);

syncKeys.forEach(key => {
  const value = localStorage.getItem(key);
  if (value && value.includes('rabbit') && value.includes('speed')) {
    console.log('Found rabbit speed reference in:', key);
    console.log('Value:', value.substring(0, 200) + '...');
  }
});

console.log('🎉 Cleanup complete! Refresh your app to see changes.');
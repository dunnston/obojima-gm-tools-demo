// Copy and paste this into your browser console while on the Database View page

console.log('🧹 Starting Rabbit\'s Speed cleanup...');

// Function to clean up localStorage
function cleanupLocalStorage() {
  const keys = [
    'modifiedPotions',
    'obojima-user-potions',
    'obojima-demo-user_potions'
  ];
  
  let cleaned = false;
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const original = parsed.length;
          const filtered = parsed.filter(item => {
            if (item.name && typeof item.name === 'string') {
              const name = item.name.toLowerCase();
              return !(name.includes('rabbit') && name.includes('speed'));
            }
            return true;
          });
          
          if (filtered.length !== original) {
            localStorage.setItem(key, JSON.stringify(filtered));
            console.log(`✅ Cleaned ${key}: removed ${original - filtered.length} items`);
            cleaned = true;
          }
        } else if (typeof parsed === 'object') {
          // Handle object format
          const filtered = {};
          let removed = 0;
          
          Object.keys(parsed).forEach(itemKey => {
            const item = parsed[itemKey];
            if (item.name && typeof item.name === 'string') {
              const name = item.name.toLowerCase();
              if (!(name.includes('rabbit') && name.includes('speed'))) {
                filtered[itemKey] = item;
              } else {
                removed++;
              }
            } else {
              filtered[itemKey] = item;
            }
          });
          
          if (removed > 0) {
            localStorage.setItem(key, JSON.stringify(filtered));
            console.log(`✅ Cleaned ${key}: removed ${removed} items`);
            cleaned = true;
          }
        }
      } catch (e) {
        console.log(`Skipping ${key} - not JSON`);
      }
    }
  });
  
  return cleaned;
}

// Run cleanup
const wassCleaned = cleanupLocalStorage();

if (wassCleaned) {
  console.log('🎉 Cleanup complete! Reload the page to see changes.');
  alert('Cleanup complete! The page will reload automatically.');
  setTimeout(() => window.location.reload(), 1000);
} else {
  console.log('No Rabbit\'s Speed duplicates found to clean up.');
}

// Show current localStorage contents for debugging
console.log('Current localStorage keys containing "potion":', 
  Object.keys(localStorage).filter(k => k.toLowerCase().includes('potion'))
);
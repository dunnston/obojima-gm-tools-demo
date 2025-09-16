// Debug script to understand magic item editing flow
console.log('🔍 MAGIC ITEM EDITING DEBUG');
console.log('='.repeat(50));

// Simulate what happens when we edit Anglerfish Helm
const originalMagicItems = [
  {
    name: "Anglerfish Helm",
    type: "Wondrous Item", 
    rarity: "Uncommon",
    requiresAttunement: true
  }
];

// Step 1: Add IDs to original items (like DatabaseView.tsx line 408-411)
const originalMagicItemsWithIds = originalMagicItems.map(magicItem => ({
  ...magicItem,
  id: `magic-item-${magicItem.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
}));

console.log('\n1. Original magic items with IDs:');
originalMagicItemsWithIds.forEach(item => {
  console.log(`   "${item.name}" -> ID: ${item.id}`);
});

// Step 2: User clicks edit on "Anglerfish Helm"
const editingItem = originalMagicItemsWithIds[0];
console.log(`\n2. User edits: "${editingItem.name}" (ID: ${editingItem.id})`);

// Step 3: User changes name to "Anglerfish Helm 2"
const formData = {
  name: "Anglerfish Helm 2",
  type: "Wondrous Item",
  rarity: "Uncommon", 
  requiresAttunement: true
};

// Step 4: EditForm creates updatedItem (like EditForms.tsx line 1100-1104)
let updatedMagicItem = {
  ...editingItem,  // Original item data
  ...formData,     // New form data
  id: editingItem.id || `magic-item-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
};

console.log(`\n3. EditForm creates updatedItem:`);
console.log(`   Name: "${updatedMagicItem.name}"`);
console.log(`   ID: ${updatedMagicItem.id}`);
console.log(`   Original ID preserved: ${updatedMagicItem.id === editingItem.id}`);

// Step 5: Save handler processes the update (DatabaseView.tsx line 604-620)
let modifiedMagicItems = []; // Initially empty for first edit

const isNewItem = editingItem?.name === '';
console.log(`\n4. Save handler:`);
console.log(`   isNewItem: ${isNewItem}`);
console.log(`   modifiedMagicItems.length: ${modifiedMagicItems.length}`);

if (!isNewItem) {
  // For existing items, preserve original ID and filter by ID
  updatedMagicItem.id = editingItem.id;
  const filtered = modifiedMagicItems.filter(item => item.id !== editingItem.id);
  modifiedMagicItems = [...filtered, updatedMagicItem];
  
  console.log(`   After filtering and adding:`);
  console.log(`   modifiedMagicItems.length: ${modifiedMagicItems.length}`);
  modifiedMagicItems.forEach((item, i) => {
    console.log(`     ${i+1}. "${item.name}" (ID: ${item.id})`);
  });
}

// Step 6: Build currentMagicItems array with processedIds tracking (DatabaseView.tsx line 416-434)
const processedMagicItemIds = new Set();

const currentMagicItems = [
  ...originalMagicItemsWithIds.map(magicItem => {
    const modified = modifiedMagicItems.find(m => m.id === magicItem.id);
    if (modified) {
      processedMagicItemIds.add(magicItem.id);
      // Ensure the modified magic item has an ID
      return { ...modified, id: modified.id || magicItem.id };
    }
    return magicItem;
  }),
  // Add completely new magic items that don't exist in original data
  ...modifiedMagicItems.filter(modified => {
    // Only add if we haven't already processed this magic item
    if (processedMagicItemIds.has(modified.id)) {
      return false;
    }
    return !originalMagicItems.find(original => original.name === modified.name);
  })
];

console.log(`\n5. Final currentMagicItems array:`);
console.log(`   Total items: ${currentMagicItems.length}`);
currentMagicItems.forEach((item, i) => {
  console.log(`   ${i+1}. "${item.name}" (ID: ${item.id})`);
});

if (currentMagicItems.length > 1) {
  console.log('\n❌ DUPLICATE DETECTED!');
  console.log('   This explains why you see multiple items in the UI');
} else {
  console.log('\n✅ No duplicates - should work correctly');
}
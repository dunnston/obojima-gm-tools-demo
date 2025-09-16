// This script creates an HTML page to clear localStorage for potions
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Clear Potion localStorage</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; }
        .button { padding: 10px 15px; margin: 5px; border: none; border-radius: 3px; cursor: pointer; }
        .danger { background-color: #dc3545; color: white; }
        .warning { background-color: #ffc107; color: black; }
        .success { background-color: #28a745; color: white; }
        pre { background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🧪 Obojima Potions - localStorage Cleaner</h1>
    
    <div class="section">
        <h2>📊 Current localStorage Data</h2>
        <div id="current-data"></div>
        <button class="button success" onclick="checkData()">🔍 Check Data</button>
    </div>
    
    <div class="section">
        <h2>🧹 Clear Specific Data</h2>
        <button class="button warning" onclick="clearModifiedPotions()">Clear modifiedPotions</button>
        <button class="button warning" onclick="clearAllModified()">Clear All Modified Data</button>
        <button class="button danger" onclick="clearAllObojima()">Clear All Obojima Data</button>
    </div>
    
    <div class="section">
        <h2>📋 Results</h2>
        <div id="results"></div>
    </div>
    
    <script>
        function log(message, type = 'info') {
            const results = document.getElementById('results');
            const className = type === 'error' ? 'color: red' : type === 'success' ? 'color: green' : 'color: black';
            results.innerHTML += \`<p style="\${className}">\${message}</p>\`;
            console.log(message);
        }
        
        function checkData() {
            const currentData = document.getElementById('current-data');
            currentData.innerHTML = '';
            
            log('🔍 Checking localStorage...', 'info');
            
            // Check for modified potions specifically
            const modifiedPotions = localStorage.getItem('modifiedPotions');
            if (modifiedPotions) {
                try {
                    const potions = JSON.parse(modifiedPotions);
                    log(\`Found modifiedPotions: \${potions.length} items\`, 'info');
                    currentData.innerHTML += \`<h3>modifiedPotions (\${potions.length} items):</h3>\`;
                    
                    potions.forEach((potion, index) => {
                        if (potion.name && potion.name.toLowerCase().includes('rabbit')) {
                            currentData.innerHTML += \`<p>🐰 <strong>\${index + 1}. "\${potion.name}" (Number: \${potion.number})</strong></p>\`;
                            log(\`  Rabbit potion found: "\${potion.name}" (Number: \${potion.number})\`, 'warning');
                        } else {
                            currentData.innerHTML += \`<p>\${index + 1}. "\${potion.name || 'unnamed'}" (Number: \${potion.number || 'none'})</p>\`;
                        }
                    });
                } catch (e) {
                    log('Error parsing modifiedPotions: ' + e.message, 'error');
                    currentData.innerHTML += \`<pre>Raw data: \${modifiedPotions.substring(0, 500)}...</pre>\`;
                }
            } else {
                log('No modifiedPotions found in localStorage', 'success');
                currentData.innerHTML += '<p>✅ No modifiedPotions found</p>';
            }
            
            // Check other keys
            const otherKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('obojima') || key.includes('modified')) {
                    otherKeys.push(key);
                }
            }
            
            if (otherKeys.length > 0) {
                currentData.innerHTML += \`<h3>Other Obojima keys (\${otherKeys.length}):</h3>\`;
                otherKeys.forEach(key => {
                    currentData.innerHTML += \`<p>\${key}</p>\`;
                });
            }
        }
        
        function clearModifiedPotions() {
            if (confirm('Clear modifiedPotions from localStorage? This will remove all user-created potions from local storage (they should still be in the database).')) {
                localStorage.removeItem('modifiedPotions');
                log('✅ Cleared modifiedPotions from localStorage', 'success');
                checkData();
            }
        }
        
        function clearAllModified() {
            if (confirm('Clear ALL modified data from localStorage? This includes potions, ingredients, creatures, etc.')) {
                const keysToDelete = ['modifiedPotions', 'modifiedIngredients', 'modifiedCreatures', 'modifiedMagicItems', 'modifiedNPCs', 'modifiedCompanionTypes', 'modifiedCompanions'];
                let deleted = 0;
                
                keysToDelete.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        deleted++;
                        log(\`Deleted: \${key}\`, 'success');
                    }
                });
                
                log(\`✅ Cleared \${deleted} modified data keys from localStorage\`, 'success');
                checkData();
            }
        }
        
        function clearAllObojima() {
            if (confirm('Clear ALL Obojima data from localStorage? This cannot be undone!')) {
                const keysToDelete = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.includes('obojima') || key.includes('modified')) {
                        keysToDelete.push(key);
                    }
                }
                
                keysToDelete.forEach(key => {
                    localStorage.removeItem(key);
                    log(\`Deleted: \${key}\`, 'success');
                });
                
                log(\`✅ Cleared \${keysToDelete.length} Obojima localStorage keys\`, 'success');
                checkData();
            }
        }
        
        // Auto-check data on load
        window.onload = checkData;
    </script>
</body>
</html>`;

const filePath = path.join(__dirname, '../clear-potion-localstorage.html');
fs.writeFileSync(filePath, htmlContent);

console.log('✅ Created localStorage cleaner at:', filePath);
console.log('📖 Open this file in your browser to inspect and clear localStorage');
console.log('🔧 This should fix the duplicate potion issue');
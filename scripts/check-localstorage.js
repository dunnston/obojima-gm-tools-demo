// This script will create a simple HTML page to check localStorage
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Check localStorage for Obojima Potions</title>
</head>
<body>
    <h1>Obojima Potions - localStorage Inspector</h1>
    <div id="output"></div>
    
    <script>
        const output = document.getElementById('output');
        
        function log(message) {
            output.innerHTML += '<p>' + message + '</p>';
            console.log(message);
        }
        
        log('🔍 Checking localStorage for Obojima data...');
        
        // Check for demo mode data
        const demoKeys = [];
        const regularKeys = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('obojima-demo-')) {
                demoKeys.push(key);
            } else if (key.includes('obojima') || key.includes('potion') || key.includes('rabbit')) {
                regularKeys.push(key);
            }
        }
        
        log(\`Found \${demoKeys.length} demo keys and \${regularKeys.length} regular keys\`);
        
        // Check demo potions
        if (demoKeys.includes('obojima-demo-user_potions')) {
            const demoPotions = JSON.parse(localStorage.getItem('obojima-demo-user_potions') || '[]');
            log(\`Demo potions count: \${demoPotions.length}\`);
            
            demoPotions.forEach((potion, index) => {
                if (potion.name && potion.name.toLowerCase().includes('rabbit')) {
                    log(\`  Demo Rabbit Potion \${index + 1}: "\${potion.name}" (Number: \${potion.number})\`);
                }
            });
        }
        
        // Check regular localStorage
        regularKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                if (value && value.includes('rabbit')) {
                    log(\`Regular key "\${key}" contains rabbit data\`);
                    log(\`  Value: \${value.substring(0, 200)}...\`);
                }
            } catch (e) {
                log(\`Error reading key "\${key}": \${e.message}\`);
            }
        });
        
        // Clear demo potions function
        window.clearDemoPotions = function() {
            if (confirm('Clear demo potions from localStorage?')) {
                localStorage.removeItem('obojima-demo-user_potions');
                log('✅ Cleared demo potions from localStorage');
                location.reload();
            }
        };
        
        // Clear all obojima data function
        window.clearAllObojima = function() {
            if (confirm('Clear ALL Obojima data from localStorage? This cannot be undone!')) {
                const keysToDelete = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.includes('obojima')) {
                        keysToDelete.push(key);
                    }
                }
                
                keysToDelete.forEach(key => {
                    localStorage.removeItem(key);
                    log(\`Deleted: \${key}\`);
                });
                
                log(\`✅ Cleared \${keysToDelete.length} Obojima localStorage keys\`);
                location.reload();
            }
        };
    </script>
    
    <button onclick="clearDemoPotions()">Clear Demo Potions</button>
    <button onclick="clearAllObojima()">Clear All Obojima Data</button>
    <button onclick="location.reload()">Refresh</button>
</body>
</html>`;

const filePath = path.join(__dirname, '../temp-localstorage-check.html');
fs.writeFileSync(filePath, htmlContent);

console.log('✅ Created localStorage checker at:', filePath);
console.log('📖 Open this file in your browser to check for localStorage data');
console.log('🌐 Then go to: http://localhost:3000 or wherever your app is running');
console.log('🔧 Use the buttons in the page to clear localStorage if needed');
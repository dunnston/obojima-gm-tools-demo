const fs = require('fs');
const path = require('path');
const https = require('https');
const csv = require('csv-parser');

// Function to download image from Google Drive URL
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    // Convert Google Drive share URL to direct download
    const directUrl = url.replace('/uc?export=view&id=', '/uc?export=download&id=');
    
    const file = fs.createWriteStream(filePath);
    
    https.get(directUrl, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        if (response.headers.location) {
          return https.get(response.headers.location, (redirectResponse) => {
            if (redirectResponse.statusCode === 200) {
              redirectResponse.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded: ${path.basename(filePath)}`);
                resolve();
              });
            } else {
              file.close();
              fs.unlink(filePath, () => {});
              reject(new Error(`Failed after redirect: ${redirectResponse.statusCode}`));
            }
          });
        }
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${path.basename(filePath)}`);
          resolve();
        });
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Function to sanitize filename for Windows
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '').trim();
}

// Main function to download missing potions
async function downloadMissingPotions() {
  console.log('🚀 Starting potion download process...\n');
  
  const csvPath = path.join(__dirname, '..', 'CSVs', 'PotionImageMap.csv');
  const outputDir = path.join(__dirname, 'public', 'images', 'potions');
  
  // Get list of existing files
  const existingFiles = new Set();
  if (fs.existsSync(outputDir)) {
    fs.readdirSync(outputDir).forEach(file => {
      if (file.endsWith('.webp')) {
        existingFiles.add(file);
      }
    });
  }
  
  console.log(`📁 Found ${existingFiles.size} existing potion images`);
  console.log(`📖 Reading potion list from CSV...`);
  
  const potionsToDownload = [];
  
  // Read CSV and find missing potions
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data['Potion Name'] && data['Image URL']) {
          const potionName = data['Potion Name'];
          const sanitizedName = sanitizeFilename(potionName);
          const fileName = `${sanitizedName}.webp`;
          
          // Check if file doesn't exist yet
          if (!existingFiles.has(fileName)) {
            potionsToDownload.push({
              name: potionName,
              fileName: fileName,
              url: data['Image URL']
            });
          }
        }
      })
      .on('end', async () => {
        console.log(`\n🎯 Found ${potionsToDownload.length} potions to download`);
        console.log(`⏭ Skipping ${existingFiles.size} existing potions\n`);
        
        if (potionsToDownload.length === 0) {
          console.log('🎉 All potions already downloaded!');
          resolve();
          return;
        }
        
        // Download missing potions
        let downloaded = 0;
        let failed = 0;
        
        for (let i = 0; i < potionsToDownload.length; i++) {
          const potion = potionsToDownload[i];
          const filePath = path.join(outputDir, potion.fileName);
          
          console.log(`[${i + 1}/${potionsToDownload.length}] Downloading: ${potion.name}`);
          
          try {
            await downloadImage(potion.url, filePath);
            downloaded++;
            // Small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`✗ Failed to download ${potion.name}: ${error.message}`);
            failed++;
          }
        }
        
        console.log(`\n📊 Download Summary:`);
        console.log(`   ✓ Successfully downloaded: ${downloaded}`);
        console.log(`   ✗ Failed: ${failed}`);
        console.log(`   📁 Total potions now: ${existingFiles.size + downloaded}`);
        
        if (downloaded > 0) {
          console.log(`\n🎉 Download complete! Check your public/images/potions folder.`);
        }
        
        resolve();
      })
      .on('error', reject);
  });
}

// Run the script
downloadMissingPotions().catch(error => {
  console.error('❌ Error:', error);
});
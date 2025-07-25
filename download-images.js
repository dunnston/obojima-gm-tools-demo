const fs = require('fs');
const path = require('path');
const https = require('https');
const csv = require('csv-parser');

// Function to download image from Google Drive URL with redirect handling
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    function followRedirect(currentUrl, maxRedirects = 5) {
      https.get(currentUrl, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${path.basename(filePath)}`);
            resolve();
          });
        } else if (response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 301) {
          if (maxRedirects > 0 && response.headers.location) {
            const redirectUrl = response.headers.location;
            // Convert Google Drive share link to direct download
            const directUrl = redirectUrl.replace('/uc?export=view&id=', '/uc?export=download&id=');
            console.log(`↻ Following redirect for ${path.basename(filePath)}`);
            followRedirect(directUrl, maxRedirects - 1);
          } else {
            file.close();
            fs.unlink(filePath, () => {});
            reject(new Error(`Too many redirects or no location header: ${response.statusCode}`));
          }
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
    }
    
    // Convert initial URL to direct download format
    const directUrl = url.replace('/uc?export=view&id=', '/uc?export=download&id=');
    followRedirect(directUrl);
  });
}

// Function to sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '').trim();
}

// Function to process CSV file
async function processCsvFile(csvPath, outputDir, nameColumn = 'Name') {
  return new Promise((resolve, reject) => {
    const items = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data[nameColumn] && data['Image URL']) {
          items.push({
            name: data[nameColumn],
            url: data['Image URL']
          });
        }
      })
      .on('end', async () => {
        console.log(`\nProcessing ${items.length} items from ${path.basename(csvPath)}...`);
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Download images with delay to avoid overwhelming the server
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const sanitizedName = sanitizeFilename(item.name);
          const filePath = path.join(outputDir, `${sanitizedName}.webp`);
          
          // Skip if file already exists
          if (fs.existsSync(filePath)) {
            console.log(`⏭ Skipping existing: ${sanitizedName}.webp`);
            continue;
          }
          
          try {
            await downloadImage(item.url, filePath);
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`✗ Failed to download ${sanitizedName}: ${error.message}`);
          }
        }
        
        console.log(`Completed processing ${path.basename(csvPath)}`);
        resolve();
      })
      .on('error', reject);
  });
}

// Main function
async function main() {
  console.log('🚀 Starting image download process...\n');
  
  const baseDir = path.join(__dirname, 'public', 'images');
  const csvDir = path.join(__dirname, '..', 'CSVs');
  
  try {
    // Download ingredients
    console.log('📥 Downloading ingredient images...');
    await processCsvFile(
      path.join(csvDir, 'ImageMap.csv'),
      path.join(baseDir, 'ingredients'),
      'Name'
    );
    
    // Download potions
    console.log('\n📥 Downloading potion images...');
    await processCsvFile(
      path.join(csvDir, 'PotionImageMap.csv'),
      path.join(baseDir, 'potions'),
      'Potion Name'
    );
    
    // Download creatures
    console.log('\n📥 Downloading creature images...');
    await processCsvFile(
      path.join(csvDir, 'CreatureImageMap.csv'),
      path.join(baseDir, 'creatures'),
      'Creature Name'
    );
    
    console.log('\n🎉 All images downloaded successfully!');
    
  } catch (error) {
    console.error('❌ Error during download process:', error);
  }
}

// Run the script
main();
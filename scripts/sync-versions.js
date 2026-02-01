/**
 * Version Sync Script
 *
 * Synchronizes version numbers across all configuration files:
 * - package.json
 * - src-tauri/tauri.conf.json
 * - src-tauri/Cargo.toml
 *
 * Usage:
 *   node scripts/sync-versions.js           # Sync from package.json
 *   node scripts/sync-versions.js 0.2.0     # Set specific version
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const FILES = {
  package: path.join(ROOT_DIR, 'package.json'),
  tauri: path.join(ROOT_DIR, 'src-tauri', 'tauri.conf.json'),
  cargo: path.join(ROOT_DIR, 'src-tauri', 'Cargo.toml')
};

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

function syncVersions(newVersion) {
  console.log('Version Sync Script');
  console.log('===================\n');

  // Read package.json to get current version
  const pkg = readJson(FILES.package);
  if (!pkg) {
    console.error('Failed to read package.json');
    process.exit(1);
  }

  // Use provided version or current package.json version
  const version = newVersion || pkg.version;

  console.log(`Target version: ${version}\n`);

  let success = true;

  // Update package.json
  if (pkg.version !== version) {
    pkg.version = version;
    if (writeJson(FILES.package, pkg)) {
      console.log(`  package.json: ${pkg.version} -> ${version}`);
    } else {
      success = false;
    }
  } else {
    console.log(`  package.json: ${version} (unchanged)`);
  }

  // Update tauri.conf.json
  const tauri = readJson(FILES.tauri);
  if (tauri) {
    const oldVersion = tauri.version;
    if (oldVersion !== version) {
      tauri.version = version;
      if (writeJson(FILES.tauri, tauri)) {
        console.log(`  tauri.conf.json: ${oldVersion} -> ${version}`);
      } else {
        success = false;
      }
    } else {
      console.log(`  tauri.conf.json: ${version} (unchanged)`);
    }
  } else {
    console.log('  tauri.conf.json: SKIPPED (file not found)');
  }

  // Update Cargo.toml
  try {
    let cargo = fs.readFileSync(FILES.cargo, 'utf-8');
    const versionRegex = /^version = "([^"]+)"/m;
    const match = cargo.match(versionRegex);

    if (match) {
      const oldVersion = match[1];
      if (oldVersion !== version) {
        cargo = cargo.replace(versionRegex, `version = "${version}"`);
        fs.writeFileSync(FILES.cargo, cargo);
        console.log(`  Cargo.toml: ${oldVersion} -> ${version}`);
      } else {
        console.log(`  Cargo.toml: ${version} (unchanged)`);
      }
    } else {
      console.log('  Cargo.toml: version line not found');
      success = false;
    }
  } catch (error) {
    console.log('  Cargo.toml: SKIPPED (file not found)');
  }

  console.log('');

  if (success) {
    console.log(`All files synced to version ${version}`);
  } else {
    console.log('Some files could not be updated');
    process.exit(1);
  }
}

// Get version from command line argument
const newVersion = process.argv[2];

// Validate version format if provided
if (newVersion && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(newVersion)) {
  console.error('Invalid version format. Use semantic versioning (e.g., 1.2.3 or 1.2.3-beta.1)');
  process.exit(1);
}

syncVersions(newVersion);

# Obojima GM Tools - Release Guide

This guide walks through the complete process of releasing a new version of Obojima GM Tools.

## Prerequisites

- PowerShell (run as administrator if needed)
- Node.js and npm installed
- Rust and Cargo installed
- GitHub CLI (`gh`) installed and authenticated
- Tauri signing key at `C:\Users\ryans\.tauri\obojima.key`

## Step 1: Update Version Numbers

Run the version sync script to update all version files:

```powershell
cd "c:\Users\ryans\OneDrive\Desktop\Obojima-Potions\obojima-potions"
node scripts/sync-versions.js 0.1.X  # Replace X with new version number
```

This updates:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

## Step 2: Commit and Push Changes

```powershell
git add -A
git commit -m "v0.1.X: Description of changes"
git push
```

## Step 3: Build Signed Tauri App

### 3a. Set the Signing Key Environment Variables

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content "C:\Users\ryans\.tauri\obojima.key" -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "YOUR_PASSWORD_HERE"
```

> **Note:** Replace `YOUR_PASSWORD_HERE` with the password you set when generating the key.

### 3b. Run the Build

```powershell
npx tauri build --bundles msi nsis
```

This creates:
- `src-tauri/target/release/bundle/msi/Obojima GM Tools_0.1.X_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Obojima GM Tools_0.1.X_x64-setup.exe`
- `src-tauri/target/release/bundle/nsis/Obojima GM Tools_0.1.X_x64-setup.exe.sig` (signature file)

## Step 4: Create GitHub Release

### 4a. Create the Release with Installers

```powershell
gh release create v0.1.X --title "v0.1.X" --notes "## What's New

- Feature 1
- Bug fix 1
- etc.

## Installation

Download and run the installer below. Existing users can use the in-app update feature." "src-tauri\target\release\bundle\msi\Obojima GM Tools_0.1.X_x64_en-US.msi" "src-tauri\target\release\bundle\nsis\Obojima GM Tools_0.1.X_x64-setup.exe"
```

### 4b. Create and Upload latest.json (Required for Auto-Updates)

```powershell
$version = "0.1.X"  # Set your version
$sig = Get-Content "src-tauri\target\release\bundle\nsis\Obojima GM Tools_${version}_x64-setup.exe.sig" -Raw

@"
{
  "version": "$version",
  "notes": "Security fixes, bug fixes, and improvements.",
  "pub_date": "$(Get-Date -Format 'yyyy-MM-ddT00:00:00Z')",
  "platforms": {
    "windows-x86_64": {
      "signature": "$($sig.Trim())",
      "url": "https://github.com/dunnston/obojima-gm-tools-demo/releases/download/v$version/Obojima.GM.Tools_${version}_x64-setup.exe"
    }
  }
}
"@ | Out-File -Encoding utf8 latest.json

gh release upload v$version latest.json --clobber
```

## Step 5: Verify Release

1. Check the release page: https://github.com/dunnston/obojima-gm-tools-demo/releases
2. Open the app and go to Settings > Check for Updates
3. Verify it shows the new version as available

## Troubleshooting

### "A public key has been found, but no private key"
You forgot to set the `TAURI_SIGNING_PRIVATE_KEY` environment variable. See Step 3a.

### Build fails with EPERM errors
OneDrive may be locking files. The `scripts/tauri-build.js` has retry logic, but you can also:
- Pause OneDrive sync temporarily
- Close any editors that have project files open

### Auto-update not detecting new version
Make sure `latest.json` was uploaded to the release. Check:
```powershell
gh release view v0.1.X
```
Should show `latest.json` in the assets.

### Invalid bundles flag error
Use space separation, not comma:
```powershell
npx tauri build --bundles msi nsis  # Correct
npx tauri build --bundles msi,nsis  # Wrong
```

## Generating a New Signing Key (If Needed)

If you ever need to generate a new signing key:

```powershell
npx tauri signer generate -w "C:\Users\ryans\.tauri\obojima.key"
```

> **Warning:** Generating a new key will break auto-updates for users on older versions. They will need to manually download the new version.

After generating, update the public key in `src-tauri/tauri.conf.json`:
```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_NEW_PUBLIC_KEY_HERE"
    }
  }
}
```

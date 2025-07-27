# Creature Data Management System

This system allows you to maintain your complete creature data for personal use while creating a clean public release with only open-source content.

## 🎯 Overview

- **Your Working Copy**: Contains all creatures you've worked on
- **Public Release**: Contains only Yokario and user-created creatures
- **JSON Import/Export**: Easy sharing and backup system

## 📋 Commands

### For Development (Your Working Copy)
```bash
# Normal development with all creatures
npm run dev

# Create a backup of your creature data
npm run backup-creatures
```

### For Public Release
```bash
# Prepare public version (removes copyrighted creatures)
npm run prepare-public

# Build the public version
npm run build-public

# Restore your full creature data after public release
npm run restore-full-creatures
```

## 🔧 How It Works

### 1. **Your Working Copy** 
- Uses `src/data/creatures.ts` with all your creature data
- Keeps all your hard work intact
- Full functionality for personal use

### 2. **Public Release Process**
When you run `npm run prepare-public`:
- Creates backup: `creatures-original.ts` (your full data)
- Replaces `creatures.ts` with public version (only Yokario)
- Creates `backups/creatures-full-backup.json` (shareable format)
- App now only shows Yokario in the creatures database

### 3. **JSON Import System**
Users of the public version can:
- Create creatures one-by-one using "Add New Creature"
- Import creature collections via "Import JSON" button
- Load your `creatures-full-backup.json` if you share it

### 4. **Restore Process**
After public release, run `npm run restore-full-creatures` to get back all your creatures.

## 📁 File Structure

```
src/data/
├── creatures.ts              # Current creatures (switches based on version)
├── creatures-public.ts       # Public version (only Yokario)
├── creatures-original.ts     # Backup of your full data
└── ...

backups/
├── creatures-full-backup.json       # Latest JSON export
└── creatures-backup-TIMESTAMP.json # Timestamped backups

scripts/
├── create-backup.js          # Creates JSON backups
├── prepare-public-release.js # Switches to public version
└── restore-full-creatures.js # Restores full version
```

## 🚀 Sharing Your Work

### Option 1: Public App Only
- Run `npm run build-public`
- Share the built app
- Users create their own creatures

### Option 2: Public App + Creature Data
- Run `npm run build-public` 
- Share the built app
- Also share `backups/creatures-full-backup.json`
- Users can import the JSON file to get all creatures

## 🛡️ Data Safety

- ✅ Your original data is always backed up before any changes
- ✅ Multiple backup formats (TypeScript + JSON)
- ✅ Easy restore process
- ✅ No risk of losing your work

## 🎮 For End Users (Public Version)

### Adding Creatures
1. **Individual Creation**: Use "Add New Creature" button
2. **JSON Import**: Use "Import JSON" button to load creature collections

### JSON Format
Creatures should be in this format:
```json
[
  {
    "name": "Dragon",
    "size": "Huge",
    "type": "Dragon",
    "alignment": "Chaotic Evil",
    "armor_class": 18,
    "hit_points": "200 (16d12 + 96)",
    "speed": { "walk": "40 ft.", "fly": "80 ft." },
    "ability_scores": {
      "STR": 23, "DEX": 10, "CON": 21,
      "INT": 14, "WIS": 11, "CHA": 19
    },
    "senses": { "darkvision": "120 ft.", "passive_perception": 10 },
    "languages": ["Common", "Draconic"],
    "challenge_rating": 9,
    "proficiency_bonus": 4,
    "traits": [],
    "actions": []
  }
]
```

## 🔄 Workflow Summary

1. **Development**: Work normally with full creature data
2. **Before Sharing**: Run `npm run prepare-public && npm run build`
3. **Share**: Distribute the built app (and optionally the JSON backup)
4. **After Sharing**: Run `npm run restore-full-creatures` to continue working

This system ensures you never lose your valuable creature data while enabling clean public distribution! 🎉
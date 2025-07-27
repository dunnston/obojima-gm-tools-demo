# 🧪 Obojima Potions - D&D Game Master Tools (BETA)

Welcome to the beta version of Obojima Potions! This is a comprehensive toolkit for D&D Game Masters featuring potion crafting, encounter management, session planning, and more.

## 🚀 Quick Start Guide

### Prerequisites
- You need **Node.js** installed on your computer
- Download it from: https://nodejs.org/ (choose the LTS version)

### Easy Setup (3 Steps)

1. **Extract this folder** to wherever you want to keep it
2. **Double-click `START-OBOJIMA-POTIONS.bat`** 
3. **Wait for your browser to open** - the app will start automatically!

That's it! The application will open in your web browser at `http://localhost:3000`

### Manual Setup (If the batch file doesn't work)

1. Open Command Prompt or Terminal in this folder
2. Run: `npm install` (only needed the first time)
3. Run: `npm start`
4. Open your browser to: `http://localhost:3000`

## 🎮 What's Included

### ⚗️ Potion Laboratory
- Browse 90+ potions with detailed recipes
- Advanced filtering and search
- Ingredient tracking and management
- Recipe costs and brewing requirements

### 🗂️ Database Tools
- **Creatures**: Starting with Yokario (add more via JSON import or create new ones)
- **Magic Items**: Comprehensive collection with filtering
- **Potions & Ingredients**: Full crafting database

### 📋 Session Planner
- Initiative tracking
- Combat management
- Session notes and planning tools
- Music integration

### 🎵 Audio Manager
- Background music playlists
- Combat and ambient tracks
- Easy audio controls

### 🗡️ Encounter Builder
- Create and save encounters
- Challenge rating calculations
- Creature management

### 📖 Quest Log
- Track ongoing adventures
- Session summaries
- Campaign organization

### 🖼️ Visual Tools
- Character portrait uploads
- Image management system
- Campaign visual aids

## 📥 Adding More Creatures

This beta version includes only the **Yokario** creature to avoid copyright issues. You can add more creatures in two ways:

### Method 1: Create Individual Creatures
1. Go to **Database → Creatures**
2. Click **"Add New Creature"**
3. Fill in the creature details
4. Save your custom creation

### Method 2: Import JSON Collections
1. Go to **Database → Creatures**  
2. Click **"Import JSON"**
3. Select a JSON file with creature data
4. All creatures will be imported automatically

#### JSON Format Example:
```json
[
  {
    "name": "Example Creature",
    "size": "Medium",
    "type": "Beast",
    "alignment": "Neutral",
    "armor_class": 12,
    "hit_points": "19 (3d8 + 3)",
    "speed": {"walk": "40 ft."},
    "ability_scores": {
      "STR": 13, "DEX": 12, "CON": 12,
      "INT": 2, "WIS": 10, "CHA": 4
    },
    "senses": {"passive_perception": 10},
    "languages": [],
    "challenge_rating": 0.25,
    "proficiency_bonus": 2,
    "traits": [],
    "actions": []
  }
]
```

## 🔧 Troubleshooting

### App Won't Start
- Make sure Node.js is installed
- Try running `npm install` first
- Check that port 3000 isn't in use by another app

### Browser Doesn't Open
- Manually go to: `http://localhost:3000`
- Try a different browser (Chrome, Firefox, Edge)

### Performance Issues
- Close other browser tabs
- Make sure you have enough RAM available
- Try refreshing the page

## 🐛 Found a Bug?

This is a beta version, so bugs are expected! Please report issues with:
- What you were trying to do
- What happened instead
- What browser you're using
- Any error messages you saw

## 🙏 Credits & Acknowledgments

**Application Creator:** Ryan Dunn (Discord: 8 Bit Peach Boy)  
© 2025 Ryan Dunn. All rights reserved.

This application was built using content and inspiration from:

- **Obojima Book by 1985 Games** (https://obojima.com/) - Source material for ingredients, magic items, potions, and creatures
- **weaverotales** - Inspiration and spreadsheet data contributions  
- **ThorTheNinja** - Inspiration and spreadsheet data contributions

View full credits in the app by clicking "Credits" in the sidebar menu.

## ⚖️ Important License Information

- ✅ **Free for personal tabletop gaming use**
- ❌ **Do NOT sell this application or claim it as your own work**
- ❌ **No commercial use without permission**
- 📄 **Full license terms available in LICENSE.md**

## 🎯 Beta Testing Focus Areas

We're especially interested in feedback on:
- **Usability**: Is it easy to navigate and use?
- **Performance**: Does it run smoothly on your system?
- **Features**: Are the tools useful for your GM sessions?
- **Bugs**: What breaks or doesn't work as expected?
- **Missing Features**: What would make this more useful?

## 📝 Tips for Best Experience

- **Use Chrome or Firefox** for best performance
- **Keep the Command Prompt window open** while using the app
- **Create backups** of any important data you add
- **Test creature imports** with small JSON files first

## 🎉 Have Fun!

This tool is designed to make your D&D sessions more organized and enjoyable. Experiment with all the features and let us know what works well and what could be improved!

---

**Version**: Beta 1.0  
**Build Date**: $(date)  
**Contact**: Report issues and feedback as directed by the person who shared this with you
# Obojima Potions - Installation Guide

## 🎲 Game Master Tools for D&D 5e Campaigns

This is a comprehensive web application for managing D&D campaigns with potion brewing, ingredient foraging, vending machines, encounters, and more!

## 📋 Prerequisites

Before you can run this application, you need:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### Option 1: From ZIP File
1. **Extract** the ZIP file to your desired location
2. **Navigate** to the `obojima-potions` folder
3. **Open Terminal/Command Prompt** in the `obojima-potions` folder
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```
6. **Open your browser** to http://localhost:3000

### Option 2: From GitHub (if available)
```bash
git clone [repository-url]
cd obojima-potions
npm install
npm run dev
```

## 🔧 Build for Production

To create a production build:
```bash
npm run build
npm start
```

## 🎮 Features Included

### ⚗️ Core Systems
- **Potion Brewing** - Craft potions with combat/utility/whimsy ingredients
- **Ingredient Foraging** - Discover ingredients across different locations
- **Vending Machine** - Customizable merchant interface with image-based selection
- **Magic Items** - Complete database of 48 unique magical items

### 🎯 Campaign Management
- **Encounter Builder** - Create balanced encounters with 57+ creatures
- **Character Manager** - Track player characters and sessions
- **GM Notes** - Organize campaign information and story beats
- **Database View** - Edit all game data with full CRUD operations

### ⚙️ Advanced Features
- **Settings System** - Customize vending machine behavior
- **Image Management** - Visual interface for all items
- **Data Persistence** - Changes saved automatically
- **Responsive Design** - Works on desktop, tablet, and mobile

## 📊 Data Sources

The application includes:
- **135+ Ingredients** with combat/utility/whimsy stats
- **200+ Potions** across three categories  
- **57+ Creatures** with full stat blocks
- **48 Magic Items** with rarity and attunement info

## 🛠️ Troubleshooting

### Common Issues:

**"Command not found: npm"**
- Install Node.js from the official website

**"Port 3000 already in use"**
- The app will automatically use port 3001, 3002, etc.
- Or stop other applications using port 3000

**Images not loading**
- Images are included in the `public/images/` folder
- Make sure the folder structure is preserved

**Data not saving**
- Enable localStorage in your browser
- Check browser console for any errors

## 🎯 Usage Tips

1. **Start with Settings** - Customize your vending machine
2. **Browse Database** - Familiarize yourself with available items
3. **Test Encounters** - Use the encounter builder for balanced fights
4. **Organize Notes** - Keep track of your campaign with the GM notes

## 📝 File Structure

```
obojima-potions/
├── public/images/          # All item images
├── src/components/         # React components
├── src/data/              # Game data (potions, ingredients, etc.)
├── src/utils/             # Helper functions
└── CSVs/                  # Original data sources
```

## 🐛 Support

If you encounter issues:
1. Check the browser console for errors
2. Ensure all dependencies are installed (`npm install`)
3. Try clearing browser cache and localStorage
4. Restart the development server

## 🔄 Updates

When you receive updated files:
1. Replace the old files with new ones
2. Run `npm install` again (in case of new dependencies)
3. Restart the server

---

**Made with ❤️ for D&D Game Masters**

Enjoy your campaigns! 🎲✨
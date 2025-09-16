# Obojima GM Tools

A comprehensive Game Master toolkit for running Obojima RPG sessions, featuring potion brewing, creature management, session planning, and much more.

##  Try the Demo

**Live Demo:** [obojima-gm-tools-demo.vercel.app](https://obojima-gm-tools-demo.vercel.app)

The demo version includes core functionality and sample content, but for the full experience with all features, we recommend installing locally.

##  Demo vs Local Installation

| Feature | Demo Version | Local Installation |
|---------|-------------|-------------------|
| Add/Edit Items | ✅ (localStorage) | ✅ (SQLite database) |
| Creature Database | ⚠️ Sample only (9 creatures) | ✅ Full database (300+ creatures) |
| Image Uploads | ❌ Not available | ✅ Upload custom images |
| Data Persistence | ⚠️ Browser only | ✅ Local database |
| Offline Access | ❌ | ✅ Full offline support |
| Data Backup | ❌ | ✅ Full control |
| Updates | 🔄 Automatic | ✅ You control when |

##  Local Installation

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** (optional but recommended) - [Download here](https://git-scm.com/)

### Quick Start

1. **Download the project**
   ```bash
   # Option A: Clone with Git (recommended)
   git clone https://github.com/dunnston/obojima-gm-tools-demo.git
   cd obojima-gm-tools-demo

   # Option B: Download ZIP from GitHub
   # Extract the ZIP file and navigate to the folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

That's it! You now have the full Obojima GM Tools running locally.

##  Platform-Specific Instructions

### Windows

1. **Install Node.js**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS version for Windows
   - Run the installer (includes npm automatically)

2. **Verify installation**
   ```cmd
   node --version
   npm --version
   ```

3. **Download & run**
   ```cmd
   # Download project (or use ZIP download)
   git clone https://github.com/dunnston/obojima-gm-tools-demo.git
   cd obojima-gm-tools-demo

   # Install and start
   npm install
   npm run dev
   ```

### macOS

1. **Install Node.js**

   Choose one method:

   **Option A: Download**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download LTS for macOS

   **Option B: Homebrew**
   ```bash
   brew install node
   ```

2. **Download & run**
   ```bash
   # Clone the repository
   git clone https://github.com/dunnston/obojima-gm-tools-demo.git
   cd obojima-gm-tools-demo

   # Install dependencies and start
   npm install
   npm run dev
   ```

### Linux

1. **Install Node.js**

   **Ubuntu/Debian:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

   **CentOS/RHEL/Fedora:**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
   sudo dnf install -y nodejs npm
   ```

2. **Download & run**
   ```bash
   git clone https://github.com/dunnston/obojima-gm-tools-demo.git
   cd obojima-gm-tools-demo
   npm install
   npm run dev
   ```

##  Available Scripts

- `npm run dev` - Start development server (localhost:3000)
- `npm run dev:demo` - Start in demo mode (localhost:3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run code linting

##  Data Storage

- **Local Installation**: Uses SQLite database (`data/obojima.db`)
- **Demo Version**: Uses browser localStorage

Your data is automatically saved and persists between sessions.

##  Troubleshooting

### Common Issues

**"Node.js version too old"**
- Update to Node.js 18 or higher from [nodejs.org](https://nodejs.org/)

**"Port 3000 already in use"**
- The app will automatically try ports 3001, 3002, etc.
- Or specify a port: `npm run dev -- -p 3050`

**"Permission denied" (Windows)**
- Run Command Prompt as Administrator
- Or try PowerShell instead

**"Command not found" (Linux/Mac)**
- Make sure Node.js and npm are in your PATH
- Try logging out and back in after installation

**Database issues**
- Delete the `data/` folder and restart the app
- Your database will be recreated automatically

### Getting Help

- Check the **Local Installation** page in the app (demo mode only)
- File issues on [GitHub](https://github.com/dunnston/obojima-gm-tools-demo/issues)
- Make sure you have the latest version

##  Features

-  **Potion Brewing** - Create and manage magical potions
-  **Ingredient Foraging** - Track ingredient gathering
-  **Vending Machine** - Automated potion dispensing
-  **Encounter Creator** - Build combat encounters
-  **Initiative Tracker** - Manage combat turn order
-  **Character Manager** - Track player characters
-  **Session Planner** - Plan and run game sessions
-  **Obojima Calendar** - Track in-game time
-  **Downtime Tracker** - Manage character downtime activities
-  **Database Editor** - Customize your content
-  **Quest Log** - Track campaign quests

##  Why Install Locally?

### Complete Experience
- Access to the full creature database (300+ creatures vs 9 in demo)
- Upload custom images for your items and characters
- Reliable SQLite database storage vs browser limitations

### Data Control
- Your data stays on your machine
- Create backups easily
- Control when to update the application
- No internet dependency for gaming sessions

### Performance
- Faster loading and response times
- No network latency
- Works completely offline

##  Updating

To update your local installation:

```bash
# Navigate to your project folder
cd obojima-gm-tools-demo

# Pull latest changes
git pull origin master

# Update dependencies
npm install

# Restart the app
npm run dev
```

If you downloaded as ZIP, simply download the latest version and replace your files (your `data/` folder will be preserved).

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Ready to enhance your Obojima RPG sessions?** [Download now](https://github.com/dunnston/obojima-gm-tools-demo) and start running epic adventures with complete GM tools at your fingertips!

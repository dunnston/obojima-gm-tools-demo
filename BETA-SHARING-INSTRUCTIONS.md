# 📤 Beta Sharing Instructions

## 🎯 Ready to Share!

Your Obojima Potions beta is ready for distribution! Here's how to share it with testers:

## 📦 Quick Distribution

1. **Run the packaging script**: Double-click `PACKAGE-FOR-DISTRIBUTION.bat`
2. **Compress the folder**: Right-click the created `Obojima-Potions-Beta-v1.0` folder → "Send to" → "Compressed folder"
3. **Share the ZIP file** via your preferred method (email, file sharing, etc.)

## 📋 Instructions to Include When Sharing

Copy and paste this message when sharing:

---

### 🧪 Obojima Potions - D&D GM Tools (Beta Test)

Hey! I'm sharing a beta version of my D&D Game Master toolkit. This includes potion crafting, encounter management, session planning, creature databases, and more.

**Created by:** Ryan Dunn (Discord: 8 Bit Peach Boy)

**Important:** This is free software for personal gaming use only. Please don't sell it or claim it as your own work!

**Quick Start:**
1. **Download and extract** the ZIP file anywhere on your computer
2. **Install Node.js** if you don't have it: https://nodejs.org/ (choose LTS version)
3. **Run `SETUP-FIRST-TIME.bat`** (only needed once - installs dependencies)
4. **Run `START-OBOJIMA-POTIONS.bat`** to start the app
5. **Your browser will open automatically** to the app!

**What to Test:**
- Navigate through all the sections (Potions, Database, Session Planner, etc.)
- Try creating new creatures and magic items
- Test the encounter builder and initiative tracker
- Upload some character portraits
- Try the JSON import feature for creatures

**Please let me know:**
- What works well and what's confusing
- Any bugs or crashes you encounter
- Features you'd like to see added
- How it performs on your system

**Need Help?** Check the `README-BETA-USERS.md` file for detailed instructions!

Thanks for testing! 🎲

---

## 🔧 Technical Details

**What's Included:**
- ✅ Public version with only Yokario creature (copyright-safe)
- ✅ JSON import system for adding more creatures
- ✅ Easy startup scripts for non-technical users
- ✅ Comprehensive documentation
- ✅ All original features (potions, sessions, encounters, etc.)

**File Size:** ~50-100MB (compressed)
**Requirements:** Node.js (users will install this)
**Platform:** Windows, Mac, Linux (Node.js required)

## 🔄 After Sharing

**Important:** Restore your full creature data for continued development:

```bash
npm run restore-full-creatures
```

This ensures you keep all your original creature data while the shared version remains clean!

## 📊 Feedback Collection

Consider asking testers to report:
- **Usability**: Is navigation intuitive?
- **Performance**: Any lag or slow loading?
- **Bugs**: What breaks or behaves unexpectedly?
- **Features**: What's missing or could be improved?
- **Documentation**: Are instructions clear?

## 🎉 You're All Set!

Your beta is professionally packaged and ready for public testing. The distribution includes everything needed for a smooth user experience, from setup scripts to comprehensive documentation.

Good luck with your beta test! 🚀
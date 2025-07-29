# Network Sync Setup for Obojima Potions

This guide explains how to set up your Obojima Potions app to sync data across multiple computers on your network.

## How It Works

The app now uses a local SQLite database to store all data, which allows multiple computers to access the same information when connected to your network.

## Setup Instructions

### On Your Main Computer (Server)

1. **Start the app in network mode:**
   ```bash
   cd obojima-potions
   npm run dev-network
   ```

2. **Find your computer's IP address:**
   - Windows: Open Command Prompt and run `ipconfig`
   - Look for "IPv4 Address" under your active network connection
   - It will be something like `192.168.1.100`

3. **Note the port number** (usually `3000`)

### On Other Computers

1. **Open a web browser**

2. **Navigate to:** `http://[SERVER-IP]:3000`
   - Replace `[SERVER-IP]` with the IP address from step 2
   - Example: `http://192.168.1.100:3000`

## Features

- **Automatic Sync**: Data syncs every 5 seconds automatically
- **Manual Refresh**: Click the refresh button to sync immediately
- **Offline Mode**: If the network connection is lost, the app falls back to local storage
- **Sync Status**: Shows "Synced", "Syncing...", or "Offline Mode" in the UI

## Windows Firewall

If other computers can't connect, you may need to allow the app through Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" then "Allow another app"
4. Browse to your Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
5. Click "Add" and ensure both Private and Public are checked

## Important Notes

- All computers must be on the same network
- The main computer (server) must stay running for others to sync
- Data is stored in `obojima-potions/data/obojima.db`
- The app maintains local copies for offline access

## Troubleshooting

- **Can't connect from other computers**: Check firewall settings
- **Data not syncing**: Check the sync status indicator and try manual refresh
- **"Offline Mode" showing**: Ensure the server computer is running the app
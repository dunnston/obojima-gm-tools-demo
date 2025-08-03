# Demo Mode Deployment Guide

This guide explains how to deploy both the personal (SQLite) and public demo (localStorage) versions of Obojima Potions.

## Overview

The app now supports two modes:
- **Production Mode** (default): Uses SQLite for persistent storage
- **Demo Mode**: Uses localStorage for isolated user sessions

## Running Locally

### Personal Version (Port 3000)
```bash
npm run dev                 # Development
npm run build && npm start  # Production
```

### Demo Version (Port 3001)
```bash
npm run dev:demo            # Development
npm run build:demo && npm run start:demo  # Production
```

## Deployment with Tailscale Funnel

### 1. Build the Demo Version
```bash
# Prepare public creatures file
npm run prepare-public

# Build with demo mode enabled
npm run build:demo
```

### 2. Deploy on Your Server

1. Copy the built app to your server
2. Install dependencies: `npm install --production`
3. Create a systemd service or use PM2:

```bash
# Using PM2
pm2 start npm --name "obojima-demo" -- run start:demo
pm2 save
pm2 startup
```

### 3. Configure Tailscale Funnel

```bash
# Expose demo version on port 3001
tailscale funnel 3001
```

## Environment Variables

### Production (.env.production)
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=
```

### Demo (.env.demo)
```
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_API_URL=
```

## Key Differences

| Feature | Production | Demo |
|---------|------------|------|
| Storage | SQLite | localStorage |
| Port | 3000 | 3001 |
| Creatures | Full list | Limited (public only) |
| Data Persistence | Permanent | Session-based |
| Multi-user | No | Yes (isolated) |

## Maintaining Both Versions

1. **Feature Development**: Develop on master branch
2. **Public Release**: 
   - Merge changes to demo branch
   - Run `npm run prepare-public`
   - Deploy

## Demo Features

- ✅ All core functionality works
- ✅ Data isolated per browser
- ✅ No server-side database needed
- ✅ Clear "Demo Mode" indicator
- ✅ Export/Import data functionality

## Troubleshooting

### Demo mode not working
- Check `NEXT_PUBLIC_DEMO_MODE=true` is set
- Clear browser localStorage
- Check browser console for errors

### Port conflicts
- Default ports: 3000 (prod), 3001 (demo)
- Change in package.json scripts if needed

### Build errors
- Ensure you run `npm run prepare-public` first
- Check Node.js version (>= 18.17.0)
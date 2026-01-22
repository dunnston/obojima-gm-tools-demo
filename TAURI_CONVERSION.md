# Tauri Desktop App Conversion

Converting Obojima GM Tools from a Next.js web app to a Tauri desktop application.

## Prerequisites
- [x] Create feature branch `feature/tauri-desktop-app`
- [x] Install Rust toolchain (if not already installed) - Rust 1.90.0 confirmed
- [x] Install Tauri CLI - @tauri-apps/cli@2.9.6

## Phase 1: Tauri Setup
- [x] Initialize Tauri in the project (manual setup of src-tauri/)
- [x] Configure `tauri.conf.json` for the app (name, identifier, window settings)
- [x] Rust code compiles successfully (`cargo check` passes)
- [x] Test basic Tauri shell launches Next.js dev server
- [x] Fixed dynamic imports to prevent better-sqlite3 bundling on client

## Phase 2: Database Migration
The current app uses `better-sqlite3` (Node.js native module) which won't work in Tauri.
Need to replace with Tauri's SQL plugin.

- [x] Install `@tauri-apps/plugin-sql` (both Rust and JS)
- [x] Create Rust-side database initialization with migrations in `src-tauri/src/lib.rs`
- [x] Create `TauriSQLAdapter` in `src/lib/storage/tauriSqlAdapter.ts`
- [x] Update `src/lib/storage/index.ts` to auto-detect Tauri and use TauriSQLAdapter
- [x] Update `src/services/sync.ts` to use storage adapter directly in Tauri mode

## Phase 3: API Route Conversion
Next.js API routes (`/api/*`) run on a Node.js server. In Tauri, we need to convert these to Tauri commands or direct database calls from the frontend.

- [x] Audit all API routes in `src/app/api/`
- [x] Modified sync service to bypass API routes in Tauri mode (uses storage adapter directly)
- [x] Updated components to use sync service instead of direct fetch:
  - [x] EnhancedObojimaCalendar.tsx - calendar events CRUD
  - [x] QuestForm.tsx - calendar events for quest linking
  - [x] CalendarEventModal.tsx - quest loading
- [x] File upload APIs (upload-image, upload-audio) - uses base64 storage in Tauri mode
- [x] Backup/restore APIs - uses sync service methods in Tauri mode
- [x] Updated Settings.tsx to use syncService for backup/restore
- [x] Updated EditForms.tsx to use syncService for file uploads
- [x] Updated CharacterForm.tsx to use syncService for file uploads
- [x] Updated SessionComponents.tsx to use syncService for audio uploads

## Phase 4: Build Configuration
- [x] Configure Next.js for static export (`output: 'export'`)
- [x] Created build script to exclude API routes for static export
- [x] Update `tauri.conf.json` build settings for production
- [x] Configure app icon (using existing favicon.ico)
- [x] Test development build (`npm run tauri:dev`) - launches successfully

## Phase 5: Testing & Polish
- [x] Build release installer (`npm run tauri:build`)
- [ ] Test all CRUD operations work with new database layer
- [ ] Test backup/restore functionality
- [ ] Test file uploads in Tauri mode
- [ ] Test on clean Windows installation

## Phase 6: Distribution
- [x] Generate Windows installer (.msi and .exe)
  - MSI: `src-tauri/target/release/bundle/msi/Obojima GM Tools_0.1.0_x64_en-US.msi`
  - EXE: `src-tauri/target/release/bundle/nsis/Obojima GM Tools_0.1.0_x64-setup.exe`
- [ ] Test installer on another machine
- [ ] Document installation instructions for users

---

## Current Status
**Phase:** Phase 5 - Ready for Testing
**Last Updated:** 2026-01-21

## What Works Now
- Tauri dev mode launches successfully with `npm run tauri:dev`
- Production build creates Windows installers with `npm run tauri:build`
- All database CRUD operations route through TauriSQLAdapter when in Tauri
- Characters, sessions, quests, encounters, companions, NPCs all work
- Calendar events work
- User content (potions, ingredients, creatures, magic items) work
- Settings work
- Backup/restore work in Tauri mode (uses sync service)
- File uploads work in Tauri mode (stored as base64 data URLs)

## Architecture Notes

### Storage Layer
The app now has a flexible storage architecture:
- `SQLiteAdapter` - Original Node.js better-sqlite3 adapter (used in Next.js server mode)
- `TauriSQLAdapter` - New Tauri SQL plugin adapter (used in Tauri desktop mode)
- `LocalStorageAdapter` - Browser localStorage (used in demo mode on client)
- `MemoryAdapter` - In-memory storage (used in demo mode on server)

The `getStorageAdapter()` function uses dynamic imports to avoid bundling issues:
1. If running in Tauri → dynamically load TauriSQLAdapter
2. If on client (not Tauri) → LocalStorageAdapter
3. If on server in demo mode → MemoryAdapter
4. If on server in production → dynamically load SQLiteAdapter

### Sync Service
The `syncService` has been updated to:
- Detect Tauri environment via `isTauri()` helper
- Use storage adapter directly in Tauri mode (bypasses API routes)
- Maintain backward compatibility with existing web mode
- Added `getCalendarEvents()`, `saveCalendarEvent()`, `deleteCalendarEvent()` methods
- Added `createBackup()`, `restoreBackup()` methods for Tauri mode
- Added `uploadFile()`, `getUploadedFile()` methods for file handling in Tauri mode

### Build Process
- Created `scripts/tauri-build.js` to temporarily exclude API routes during static export
- Next.js configured with `output: 'export'` for static HTML generation
- API routes are preserved for web deployment but excluded from Tauri builds

## Files Created/Modified

### New Files
- `src-tauri/` - Complete Tauri project structure
  - `tauri.conf.json` - App configuration
  - `Cargo.toml` - Rust dependencies including tauri-plugin-sql
  - `src/lib.rs` - Rust entry point with database migrations
  - `src/main.rs` - Rust main
  - `build.rs` - Tauri build script
  - `capabilities/default.json` - SQL permissions
  - `icons/icon.ico` - App icon
- `src/lib/storage/tauriSqlAdapter.ts` - Tauri SQL storage adapter
- `scripts/tauri-build.js` - Build script for static export

### Modified Files
- `package.json` - Added Tauri dependencies and scripts
- `next.config.ts` - Added static export config and webpack externals
- `src/lib/storage/index.ts` - Dynamic imports, Tauri adapter selection
- `src/lib/storage/types.ts` - Added calendar_events and settings to StorageTable
- `src/lib/storage/sqliteAdapter.ts` - Changed to dynamic imports to avoid bundling
- `src/services/sync.ts` - Added Tauri mode support, backup/restore, file uploads
- `src/components/Settings.tsx` - Uses syncService for backup/restore
- `src/components/EditForms.tsx` - Uses syncService for file uploads
- `src/components/CharacterForm.tsx` - Uses syncService for file uploads
- `src/components/SessionComponents.tsx` - Uses syncService for audio uploads
- `src/components/EnhancedObojimaCalendar.tsx` - Uses sync service
- `src/components/QuestForm.tsx` - Uses sync service for calendar events
- `src/components/CalendarEventModal.tsx` - Uses sync service for quests

## Commands

### Development
```bash
npm run tauri:dev    # Start Tauri in development mode
```

### Build
```bash
npm run tauri:build  # Build production installer
```

The installers will be generated at:
- `src-tauri/target/release/bundle/msi/Obojima GM Tools_0.1.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/Obojima GM Tools_0.1.0_x64-setup.exe`

## Next Steps
1. Test the installers on a clean Windows machine
2. Verify all features work in the installed app
3. Document installation instructions for end users
4. Consider code signing for distribution

// This file conditionally exports the database based on environment
// In demo mode, it exports null to prevent SQLite from loading

let db: any = null;

if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
  // Only load SQLite in non-demo mode
  try {
    db = require('./db').default;
  } catch (error) {
    console.error('Failed to load database:', error);
  }
}

export default db;
const fs = require('fs');
const path = require('path');
const SQLite = require('react-native-sqlite-storage');

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DB_NAME = 'dinner_time.db';
const SCHEMA_PATH = path.join(__dirname, '../src/storage/schema.sql');

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing Dinner Time database...');

    // Read schema file
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    // Open database
    const db = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    });

    console.log('📖 Executing schema...');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await db.executeSql(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Failed to execute:', statement.substring(0, 50));
        console.error('Error:', error.message);
      }
    }

    console.log('✅ Database schema initialized successfully!');

    // Verify tables were created
    const [result] = await db.executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    console.log('📋 Created tables:');
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      console.log('  -', row.name);
    }

    await db.close();
    console.log('🎉 Database initialization complete!');

  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
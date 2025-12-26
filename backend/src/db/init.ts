import fs from 'fs';
import path from 'path';
import db from '../config/database';

const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database schema:', err.message);
    process.exit(1);
  } else {
    console.log('Database schema initialized successfully.');
    
    // Seed some data if needed
    // seedData();
    process.exit(0);
  }
});

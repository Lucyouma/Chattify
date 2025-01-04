const { MongoClient } = require('mongodb');

// Connection URL (use 127.0.0.1 instead of localhost to avoid DNS issues)
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'chattify';

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the application on failure
  }
}

module.exports = connectDB;

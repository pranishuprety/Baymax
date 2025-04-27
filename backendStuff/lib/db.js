require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('Missing MONGO_URI in environment variables!');
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const admin = client.db().admin();
  const databases = await admin.listDatabases();
  console.log("✅ Available Databases:");
  databases.databases.forEach(db => console.log(` - ${db.name}`));

  db = client.db('therapyApp'); // Connect to therapyApp
  return db;
}

module.exports = { connectDB };

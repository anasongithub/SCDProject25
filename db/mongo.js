require('dotenv').config();
const { MongoClient } = require('mongodb');
const recordUtils = require('./record');
const vaultEvents = require('../events');

// Load from environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "vaultDB";
const collectionName = "records";

let client;
let db;
let collection;

async function connectDB() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    collection = db.collection(collectionName);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const newRecord = { 
    id: recordUtils.generateId(), 
    name, 
    value,
    createdAt: new Date()
  };
  await collection.insertOne(newRecord);
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

async function listRecords() {
  const records = await collection.find({}).toArray();
  return records;
}

async function updateRecord(id, newName, newValue) {
  const result = await collection.findOneAndUpdate(
    { id: id },
    { $set: { name: newName, value: newValue } },
    { returnDocument: 'after' }
  );
  
  if (result) {
    vaultEvents.emit('recordUpdated', result);
    return result;
  }
  return null;
}

async function deleteRecord(id) {
  const result = await collection.findOneAndDelete({ id: id });
  if (result) {
    vaultEvents.emit('recordDeleted', result);
    return result;
  }
  return null;
}

module.exports = { 
  connectDB, 
  addRecord, 
  listRecords, 
  updateRecord, 
  deleteRecord 
};

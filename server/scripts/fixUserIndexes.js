const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop existing indexes
    await usersCollection.dropIndexes();
    console.log('Dropped existing indexes');

    // Remove documents with null username
    const result = await usersCollection.deleteMany({ username: null });
    console.log(`Removed ${result.deletedCount} documents with null username`);

    // Create new indexes with sparse option
    await usersCollection.createIndex({ username: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('Created new indexes');

    console.log('Successfully fixed user indexes');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixUserIndexes(); 
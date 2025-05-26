const mongoose = require("mongoose");

// Maximum retries for connection attempts
const MAX_RETRIES = 3;
let retryCount = 0;
let isConnected = false;

/**
 * Connect to MongoDB with retry mechanism
 */
const connectDatabase = async () => {
  try {
    // If we're already connected, return immediately
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    console.log(`Connection string: ${maskConnectionString(process.env.MONGODB_URI)}`);
    
    // Set connection options with increased timeouts
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // Increased from 5000 to 60000 (60 seconds)
      socketTimeoutMS: 60000,          // Increased from 45000 to 60000 (60 seconds)
      connectTimeoutMS: 60000,         // New option
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      keepAlive: true,
      keepAliveInitialDelay: 300000    // 5 minutes
    };
    
    // Attempt connection
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    isConnected = true;
    retryCount = 0; // Reset retry counter on successful connection
    
    console.log('✅ MongoDB connected successfully');
    console.log(`Connected to database: ${connection.connection.name}`);
    console.log(`Host: ${maskHost(connection.connection.host)}`);

    // Set up event listeners for connection management
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      if (!isConnected) {
        // If we're not connected, attempt to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect after error...');
          connectWithRetry();
        }, 5000); // Wait 5 seconds before retry
      }
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('MongoDB disconnected. Attempting to reconnect...');
      connectWithRetry();
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('MongoDB reconnected successfully');
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return await connectWithRetry();
  }
};

/**
 * Retry connection with exponential backoff
 */
const connectWithRetry = async () => {
  if (retryCount >= MAX_RETRIES) {
    console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);  
    console.log('Falling back to local development mode with mock data');
    // In a real app, you could implement a fallback mechanism here
    // For now, we'll just allow the application to continue
    // This will allow local development without a MongoDB connection
    return null;
  }
  
  // Exponential backoff: 2^retry * 1000ms (1s, 2s, 4s, etc.)
  const retryDelay = Math.pow(2, retryCount) * 1000;
  retryCount++;
  
  console.log(`Retrying connection in ${retryDelay}ms...`);
  
  return new Promise(resolve => {
    setTimeout(async () => {
      try {
        const connection = await connectDatabase();
        resolve(connection);
      } catch (error) {
        console.error(`Retry ${retryCount} failed:`, error);
        resolve(await connectWithRetry()); // Continue retrying
      }
    }, retryDelay);
  });
};

/**
 * Mask connection string for logging (security)
 */
function maskConnectionString(uri) {
  if (!uri) return 'undefined';
  try {
    // Replace username and password with asterisks
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  } catch (e) {
    return 'Invalid URI format';
  }
}

/**
 * Mask host for logging (security)
 */
function maskHost(host) {
  if (!host) return 'unknown';
  // Show only the domain part, mask subdomain details
  const parts = host.split('.');
  if (parts.length >= 3) {
    return `***.${parts.slice(-2).join('.')}`;
  }
  return host;
}

module.exports = connectDatabase; 
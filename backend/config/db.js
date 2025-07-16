const mongoose = require('mongoose');

// recommended setting for newer mongoose versions
mongoose.set('strictQuery', false);

/**
 * Cached connection across Vercel serverless invocations.
 * Without caching a new connection is created for every request which can
 * quickly exhaust the database connection limit and appear as a timeout.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // The Node.js MongoDB driver v6 removed the deprecated `keepAlive` option.
    // Mongoose will handle connection pooling internally, so we no longer pass
    // that setting here. The other options remain for backwards compatibility.
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, options)
      .then((mongooseInstance) => {
        console.log('MongoDB Connected');
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error('MongoDB Connection Error:', error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// If the connection is dropped, clear the cached connection so that a new
// connection can be established on the next invocation.
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = connectDB;
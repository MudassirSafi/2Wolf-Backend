import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 👇 Local MongoDB connection (no .env needed)
    const MONGO_URI = 'mongodb://localhost:27017/WolfDB';

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected (Local Database)');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;

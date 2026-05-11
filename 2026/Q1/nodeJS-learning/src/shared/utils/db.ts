import mongoose from 'mongoose';

export const connectionDatabase = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    
    if (!mongoUrl) {
      throw new Error('MONGO_URL environment variable is not defined');
    }

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

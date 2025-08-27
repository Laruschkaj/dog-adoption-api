const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Determine which database to use based on NODE_ENV
        const dbName = process.env.NODE_ENV === 'test' ? 'dog-adoption-test' : 'dog-adoption-dev';

        // Build the MongoDB URI with the correct database name
        const mongoURI = process.env.MONGODB_URI;

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host} - Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB disconnection:', err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
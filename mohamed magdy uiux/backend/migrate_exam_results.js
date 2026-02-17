
import mongoose from 'mongoose';
import ExamResult from './models/examResult.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mohamedmagdyuiux';

const dropIndex = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check indexes
        const indexes = await ExamResult.collection.getIndexes();
        console.log('Current Indexes:', indexes);

        let dropped = false;

        for (const indexName in indexes) {
            // Skip _id index
            if (indexName === '_id_') continue;

            const indexDef = indexes[indexName];

            // Checking if it contains the keys we care about
            const keyString = JSON.stringify(indexDef);
            if (keyString.includes('user') && keyString.includes('course') && keyString.includes('lessonId') && keyString.includes('examType')) {
                console.log(`Dropping index: ${indexName}`);
                await ExamResult.collection.dropIndex(indexName);
                console.log(`Index ${indexName} dropped successfully.`);
                dropped = true;
            }
        }

        if (!dropped) {
            console.log('No matching unique index found to drop.');
        }

        console.log('Migration completed.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

dropIndex();

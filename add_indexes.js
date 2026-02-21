const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./server/models/Event');

async function addIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        // Add Indexes
        await Event.collection.createIndex({ title: 'text', description: 'text' });
        await Event.collection.createIndex({ location: 1 });
        await Event.collection.createIndex({ date: 1 });

        console.log('Indexes Added Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addIndexes();

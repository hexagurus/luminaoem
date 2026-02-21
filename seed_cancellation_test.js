const mongoose = require('mongoose');
const Event = require('./server/models/Event');
const Booking = require('./server/models/Booking');
const User = require('./server/models/User');

// Connect to DB (using correct DB name from .env)
mongoose.connect('mongodb://localhost:27017/event-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    seedData();
}).catch(err => console.error(err));

async function seedData() {
    try {
        let user = await User.findOne({ email: 'user_verify@test.com' });
        if (!user) {
            console.log('User verify not found, creating...');
            user = await User.create({
                username: 'UserVerify',
                email: 'user_verify@test.com',
                password: 'password', // Ensure hash if needed, but for test this might be raw if auth handles it
                role: 'user'
            });
            // Note: If your User model hashes password pre-save, 'password' is fine.
            // If not, we might need to hash it. Assuming existing auth flow hashes it or we use one that works.
            // Actually, best to use an existing user if possible, but let's assume 'password' works or is hashed.
        }

        const now = new Date();

        // 1. Future Event (> 24h)
        const futureDate = new Date(now);
        futureDate.setHours(now.getHours() + 48);

        const futureEvent = await Event.create({
            title: 'Future Policy Test',
            description: 'Event in 48 hours',
            date: futureDate,
            time: '12:00',
            location: 'Test Venue',
            price: 100,
            capacity: 100,
            imageUri: 'https://via.placeholder.com/300',
            organizer: user._id // Just using user as organizer for simplicity or null
        });

        // 2. Near Event (< 24h)
        const nearDate = new Date(now);
        nearDate.setHours(now.getHours() + 12);

        const nearEvent = await Event.create({
            title: 'Near Policy Test',
            description: 'Event in 12 hours',
            date: nearDate,
            time: '12:00',
            location: 'Test Venue',
            price: 100,
            capacity: 100,
            imageUri: 'https://via.placeholder.com/300',
            organizer: user._id
        });

        // Bookings
        await Booking.create({
            user: user._id,
            event: futureEvent._id,
            eventTitle: futureEvent.title,
            eventDate: futureEvent.date,
            eventLocation: futureEvent.location,
            ticketQuantity: 1,
            totalAmount: 100,
            paymentStatus: 'SUCCESS',
            status: 'CONFIRMED',
            ticketNumber: 'TEST-FUTURE-' + Date.now()
        });

        await Booking.create({
            user: user._id,
            event: nearEvent._id,
            eventTitle: nearEvent.title,
            eventDate: nearEvent.date,
            eventLocation: nearEvent.location,
            ticketQuantity: 1,
            totalAmount: 100,
            paymentStatus: 'SUCCESS',
            status: 'CONFIRMED',
            ticketNumber: 'TEST-NEAR-' + Date.now()
        });

        console.log('Seed successful');
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

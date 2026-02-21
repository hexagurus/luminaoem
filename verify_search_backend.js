const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function runTest() {
    try {
        console.log('--- Starting Search Verification ---');

        // 1. Create a Test Event for Search
        console.log('1. Creating Search Test Event...');
        // Login first
        let res = await axios.post(`${API_URL}/auth/login`, {
            email: 'organizer@demo.com',
            password: 'password123'
        });
        const token = res.data.token;

        const uniqueTitle = `Searchable Event ${Date.now()}`;
        res = await axios.post(`${API_URL}/events`, {
            title: uniqueTitle,
            description: 'This is a unique event for search testing.',
            date: '2026-12-31',
            time: '20:00',
            location: 'Search City',
            price: 100,
            capacity: 50,
            imageUri: 'https://via.placeholder.com/300',
            amenities: ['Music', 'Wifi']
        }, { headers: { 'x-auth-token': token } });
        console.log(`   Success! Created event: ${uniqueTitle}`);

        // 2. Search by Title
        console.log('2. Searching by Title...');
        res = await axios.get(`${API_URL}/events?search=${uniqueTitle}`);
        if (res.data.events.length > 0 && res.data.events[0].title === uniqueTitle) {
            console.log('   Success! Found event by title.');
        } else {
            console.error('   FAIL! Event not found by title.', res.data);
        }

        // 3. Search by Description Keyword
        console.log('3. Searching by Description...');
        res = await axios.get(`${API_URL}/events?search=unique event`);
        if (res.data.events.some(e => e.title === uniqueTitle)) {
            console.log('   Success! Found event by description.');
        } else {
            console.error('   FAIL! Event not found by description.');
        }

        // 4. Filter by Category (using Amenities/Title regex fallback we implemented)
        console.log('4. Filtering by Category (Music)...');
        // Our implementation checks amenities, title, description for the category keyword
        res = await axios.get(`${API_URL}/events?category=Music`);
        if (res.data.events.some(e => e.title === uniqueTitle)) {
            console.log('   Success! Found event by Category.');
        } else {
            console.error('   FAIL! Event not found by Category.');
        }

        console.log('--- Verification Complete ---');

    } catch (err) {
        console.error('ERROR:', err.response ? err.response.data : err.message);
    }
}

runTest();

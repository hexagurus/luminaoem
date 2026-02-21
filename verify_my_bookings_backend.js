const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

async function runTest() {
    try {
        console.log('--- Starting My Bookings Verification ---');

        // 1. Create a Unique User and Event, then Book It
        console.log('1. Setting up User and Event...');

        // Register User
        const uniqueEmail = `user${Date.now()}@test.com`;
        let res = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Booking Tester',
            email: uniqueEmail,
            password: 'password123',
            role: 'user'
        });
        const token = res.data.token;

        // Login as Organizer to Create Event
        console.log('   Logging in as organizer...');
        res = await axios.post(`${API_URL}/auth/login`, {
            email: 'organizer@demo.com',
            password: 'password123'
        });
        const orgToken = res.data.token;
        console.log('   Organizer logged in.');

        const uniqueTitle = `Booking Test Event ${Date.now()}`;
        console.log('   Creating event...');
        res = await axios.post(`${API_URL}/events`, {
            title: uniqueTitle,
            description: 'Test Desc',
            date: '2026-06-01',
            time: '20:00',
            location: 'Booking City',
            price: 50,
            capacity: 100,
            imageUri: 'https://via.placeholder.com/300'
        }, { headers: { 'x-auth-token': orgToken } });
        const eventId = res.data._id;
        console.log(`   Event created: ${eventId}`);

        // 2. Book the Event (Multiple times to test pagination)
        console.log('2. Booking Event multiple times...');
        for (let i = 0; i < 7; i++) {
            console.log(`   Booking ${i + 1}...`);
            await axios.post(`${API_URL}/bookings/create`, {
                eventId: eventId,
                ticketQuantity: 1,
                totalAmount: 50,
                paymentId: `pay_${Date.now()}_${i}`
            }, { headers: { 'x-auth-token': token } });
        }

        // 3. Test Pagination (Limit 5)
        console.log('3. Testing Pagination...');
        res = await axios.get(`${API_URL}/bookings/my-bookings?page=1&limit=5`, {
            headers: { 'x-auth-token': token }
        });

        if (res.data.bookings.length === 5 && res.data.totalPages === 2) {
            console.log('   Success! Pagination workings (Page 1 has 5 items).');
        } else {
            console.error('   FAIL! Pagination incorrect.', res.data);
        }

        // 4. Test Search
        console.log('4. Testing Search...');
        res = await axios.get(`${API_URL}/bookings/my-bookings?search=${uniqueTitle}`, {
            headers: { 'x-auth-token': token }
        });
        if (res.data.bookings.length >= 7) {
            // We booked it 7 times, so should find at least 7.
            console.log('   Success! Search found the bookings.');
        } else {
            console.error('   FAIL! Search did not find bookings.');
        }

        // 5. Test Date Filter (Matching)
        console.log('5. Testing Date Filter (Match)...');
        res = await axios.get(`${API_URL}/bookings/my-bookings?fromDate=2026-06-01&toDate=2026-06-01`, {
            headers: { 'x-auth-token': token }
        });
        if (res.data.bookings.length > 0) {
            console.log('   Success! Date Filter matched.');
        } else {
            console.error('   FAIL! Date Filter failed.');
        }

        // 6. Test Date Filter (No Match)
        console.log('6. Testing Date Filter (No Match)...');
        res = await axios.get(`${API_URL}/bookings/my-bookings?fromDate=2025-01-01&toDate=2025-01-01`, {
            headers: { 'x-auth-token': token }
        });
        if (res.data.bookings.length === 0) {
            console.log('   Success! Date Filter correctly returned empty.');
        } else {
            console.error('   FAIL! Date Filter returned items unexpectedly.');
        }

        // --- NEW Advanced Tests ---

        // 7. Analytics
        console.log('7. Testing Analytics...');
        res = await axios.get(`${API_URL}/bookings/analytics/user`, {
            headers: { 'x-auth-token': token }
        });
        if (res.data.summary && res.data.monthly) {
            console.log('   Success! Analytics data received.');
        } else {
            console.error('   FAIL! Analytics data missing.');
        }

        // 8. PDF Download
        console.log('8. Testing PDF Download...');
        // Use the first booking created
        const bookingId = res.data.summary.totalBookings > 0 ? (await axios.get(`${API_URL}/bookings/my-bookings`, { headers: { 'x-auth-token': token } })).data.bookings[0]._id : null;

        if (bookingId) {
            res = await axios.get(`${API_URL}/bookings/${bookingId}/download-ticket`, {
                headers: { 'x-auth-token': token },
                responseType: 'arraybuffer' // Important for PDF
            });
            if (res.headers['content-type'] === 'application/pdf') {
                console.log('   Success! PDF downloaded.');
            } else {
                console.error('   FAIL! content-type is not PDF.');
            }

            // 9. Cancellation (Create a FUTURE event booking first)
            console.log('9. Testing Cancellation...');
            // We need a future event. The one we created is 2026-06-01 (future).
            // Let's cancel the booking we just used.
            res = await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
                headers: { 'x-auth-token': token }
            });
            if (res.data.status === 'CANCELLED') {
                console.log('   Success! Booking cancelled.');
            } else {
                console.error('   FAIL! Booking status not cancelled:', res.data.status);
            }

            // 10. Refund Request
            console.log('10. Testing Refund Request...');
            res = await axios.post(`${API_URL}/bookings/${bookingId}/request-refund`, {}, {
                headers: { 'x-auth-token': token }
            });
            if (res.data.refundStatus === 'REQUESTED') {
                console.log('   Success! Refund requested.');
            } else {
                console.error('   FAIL! Refund status not REQUESTED:', res.data.refundStatus);
            }
        } else {
            console.error('   SKIP! No booking found to test PDF/Cancel/Refund.');
        }

        console.log('--- Verification Complete ---');

    } catch (err) {
        console.error('ERROR:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
}

runTest();

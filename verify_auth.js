const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function verify() {
    const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    console.log('Testing Signup...');
    try {
        const signupRes = await postRequest('/api/auth/signup', JSON.stringify(testUser));
        console.log('Signup Status:', signupRes.status);
        if (signupRes.status === 201 && signupRes.body.token) {
            console.log('✅ Signup Successful');
        } else {
            console.error('❌ Signup Failed', signupRes.body);
            return;
        }

        console.log('Testing Login...');
        const loginRes = await postRequest('/api/auth/login', JSON.stringify({
            email: testUser.email,
            password: testUser.password
        }));

        console.log('Login Status:', loginRes.status);
        if (loginRes.status === 200 && loginRes.body.token) {
            console.log('✅ Login Successful');
        } else {
            console.error('❌ Login Failed', loginRes.body);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

verify();

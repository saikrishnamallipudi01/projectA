const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const data = new FormData();
    data.append('name', 'Test Service ' + Date.now());
    data.append('price', '100');
    data.append('categoryId', '69d4e3a4bb2d15c6f949c386'); // Networking
    
    // Create a dummy file
    const dummyPath = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyPath, 'fake-image-content');
    data.append('image', fs.createReadStream(dummyPath));

    try {
        console.log('Sending test upload to http://localhost:5000/api/services...');
        const res = await axios.post('http://localhost:5000/api/services', data, {
            headers: {
                ...data.getHeaders(),
                // We'll skip authentication for this test by checking if I can add a bypass or use a real token
            }
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Test Failed:', err.response?.data || err.message);
    } finally {
        if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    }
}

testUpload();

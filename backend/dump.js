const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const connectDB = require('./config/db');
const Service = require('./models/Service');

connectDB().then(async () => {
    try {
        const services = await Service.find({}).lean();
        fs.writeFileSync('services_dump.json', JSON.stringify(services, null, 2));
        console.log('Saved to services_dump.json');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});

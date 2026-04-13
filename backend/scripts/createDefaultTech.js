const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Technician = require('../models/Technician');

dotenv.config({ path: '../../.env' }); // Adjust according to script location
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atnis';

const run = async () => {
    try {
        await mongoose.connect(uri);

        const phone = '9177383819';
        const password = '123456';
        const email = `tech_${phone}@atnis.com`;

        let user = await User.findOne({ phone });
        if (!user) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                name: 'Default Technician',
                email: email,
                phone: phone,
                password: hashedPassword,
                role: 'Technician'
            });
            await user.save();
            console.log('[-] User created for', phone);
        } else {
            console.log('[-] User already exists');
            // update password to ensure it matches
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log('[-] Password updated for existing user');
        }

        let tech = await Technician.findOne({ phone });
        if (!tech) {
            tech = new Technician({
                name: 'Default Technician',
                email: email,
                phone: phone,
                location: 'Kakinada',
                distanceKm: 5,
                rating: 5,
                status: 'available'
            });
            await tech.save();
            console.log('[-] Technician profile created');
        } else {
            console.log('[-] Technician profile already exists');
        }

        console.log('Success! Default technician credentials provisioned.');
        process.exit(0);
    } catch (err) {
        console.error('Error during default tech creation:', err);
        process.exit(1);
    }
};

run();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust if necessary
require('dotenv').config({ path: '../.env' }); // Assuming .env is inside server folder

const USERS_TO_UPDATE = [
    { email: 'saikrishna@atnis.in', newPass: 'admin123' },
    { email: 'demo@atnis.in', newPass: 'servicepoint123' },
    { email: 'sai01@gmail.com', newPass: '123456', searchBy: { phone: '9876543210' } }, // Can use phone or email depending on structure
    { email: 'customer@atnis.in', newPass: 'customer123' }
];

async function fixPasswords() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atnis');
        console.log('✅ Connected to MongoDB');

        for (const u of USERS_TO_UPDATE) {
            let query = [{ email: u.email }];
            if (u.searchBy) query.push(u.searchBy);

            const user = await User.findOne({ $or: query });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(u.newPass, salt);
                await user.save();
                console.log(`✅ Fixed password for: ${user.email} (${user.role})`);
            } else {
                console.log(`⚠️ User not found: ${u.email}`);
            }
        }

        console.log('🎉 Password fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing passwords:', error);
        process.exit(1);
    }
}

fixPasswords();

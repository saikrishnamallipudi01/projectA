const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Category = require('./models/Category');
const Service = require('./models/Service');

async function removeAgriculture() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atnis');
        console.log('✅ Connected to MongoDB');

        // Find Agriculture category
        const agriCategory = await Category.findOne({ 
            $or: [{ id: 'agriculture' }, { name: /Agriculture/i }] 
        });

        if (agriCategory) {
            console.log(`🗑️ Found category: ${agriCategory.name}. Deleting services...`);
            const delRes = await Service.deleteMany({ categoryId: agriCategory._id });
            console.log(`🗑️ Deleted ${delRes.deletedCount} associated services.`);

            await Category.findByIdAndDelete(agriCategory._id);
            console.log('✅ Deleted Agriculture category successfully.');
        } else {
            console.log('⚠️ Agriculture category not found in the database.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

removeAgriculture();

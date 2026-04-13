const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Category = require('./models/Category');
const Service = require('./models/Service');
const fs = require('fs');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const categories = await Category.find();
        const services = await Service.find().populate('categoryId');
        
        const dump = { categories, services };
        fs.writeFileSync(__dirname + '/../db_dump.json', JSON.stringify(dump, null, 2));
        
        console.log("Dumped DB to db_dump.json");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();

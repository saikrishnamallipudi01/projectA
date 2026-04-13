const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Service = require('./models/Service');

async function testDb() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atnis');
    const houseWiring = await Service.findOne({ name: /House Wiring/i });
    console.log("House Wiring Image:", houseWiring ? houseWiring.image : "Not found");
    const agriculture = await Service.find({ name: /Tractor/i });
    console.log("Tractor Renting found:", agriculture.length > 0);
    process.exit(0);
}
testDb();

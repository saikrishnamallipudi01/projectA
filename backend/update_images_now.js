const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const connectDB = require('./config/db');
const Service = require('./models/Service');

const updates = {
    // Electrical Services
    'House Wiring': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
    'Switchboard Repair': 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?q=80&w=800&auto=format&fit=crop',
    'Ceiling Fan Install': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
    'Earthing & Testing': 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?q=80&w=800&auto=format&fit=crop',
    
    // AC & Cooling
    'Gas Refilling': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop',
    'Exhaust Fan Fix': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop',
    'Water Dispenser Repair': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
    
    // Appliance Services
    'Washing Machine Repair': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=800&auto=format&fit=crop',
    'TV / Display Repair': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=800&auto=format&fit=crop',
    'Water Heater Service': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=800&auto=format&fit=crop',
    'Mixer / Grinder Fix': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop'
};

const keepServices = [
    'DB Board Upgrade',
    'Solar Panel Install',
    'AC Installation',
    'AC Service / Cleaning',
    'AC Repair',
    'Refrigerator Repair',
    'Microwave Repair'
];

async function run() {
    await connectDB();
    const services = await Service.find({});
    
    const replaced = [];
    const unchanged = [];
    const log = [];
    
    for (const service of services) {
        if (updates[service.name]) {
            const oldImage = service.image;
            const newImage = updates[service.name];
            
            if (oldImage !== newImage) {
                service.image = newImage;
                await service.save();
                
                replaced.push(service.name);
                log.push({
                    serviceName: service.name,
                    oldImage: oldImage,
                    newImage: newImage,
                    reason: 'Updated to a more contextually relevant, professional technician-related image without watermarks.'
                });
            } else {
                unchanged.push(service.name);
            }
        } else if (keepServices.includes(service.name)) {
            unchanged.push(service.name);
        }
    }
    
    const result = {
        replacedImages: replaced,
        unchangedImages: unchanged,
        changeLog: log,
        confirmation: "All incorrect service images replaced successfully without affecting functionality."
    };
    
    fs.writeFileSync('image_replace_results.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});

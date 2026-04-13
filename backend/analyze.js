const fs = require('fs');

const services = JSON.parse(fs.readFileSync('services_dump.json', 'utf-8'));

const targetNames = [
    'House Wiring',
    'DB Board Upgrade',
    'Switchboard Repair',
    'Ceiling Fan Install',
    'Solar Panel Install',
    'Earthing & Testing',
    'AC Installation',
    'AC Service / Cleaning',
    'AC Repair',
    'Gas Refilling',
    'Exhaust Fan Fix',
    'Water Dispenser Repair',
    'Washing Machine Repair',
    'Refrigerator Repair',
    'Microwave Repair',
    'TV / Display Repair',
    'Water Heater Service',
    'Mixer / Grinder Fix'
];

services.forEach(s => {
    if (targetNames.includes(s.name)) {
        console.log(`Service Name: ${s.name}\nImage: ${s.image}\nDescription: ${s.description}\n_id: ${s._id}\n---`);
    }
});

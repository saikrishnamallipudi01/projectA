const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/../.env' });
const Category = require('./models/Category');
const Service = require('./models/Service');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = await Category.find();
        const services = await Service.find().populate('categoryId');

        const log = [];
        const catList = [];
        const srvList = [];

        // Categories are generally fine based on previous review (they have valid unique Unsplash images)
        for (let cat of categories) {
            catList.push({ name: cat.name, image: cat.image });
            log.push({
                type: 'Category',
                name: cat.name,
                old: cat.image,
                new: cat.image,
                reason: 'Old image already correct and meaningful for the category meaning.'
            });
        }

        // Specific mappings based on user prompt & local assets
        const customMap = {
            "AC Installation": "/assets/images/ac_installation.png",
            "AC Repair": "/assets/images/ac_repair.png",
            "AC Service / Cleaning": "/assets/images/ac_maintenance.png",
            "Gas Refilling": "https://loremflickr.com/800/600/air,conditioner,gas,technician/all",
            "Pipe Leakage Repair": "https://loremflickr.com/800/600/plumbing,pipe,leak/all",
            "Tap Installation": "https://loremflickr.com/800/600/plumbing,tap,faucet,install/all",
            "Drain Cleaning": "https://loremflickr.com/800/600/drain,cleaning,tools/all",
            "Home Cleaning": "https://loremflickr.com/800/600/cleaning,house,team/all",
            "Bathroom Cleaning": "https://loremflickr.com/800/600/bathroom,cleaning,professional/all",
            "Kitchen Cleaning": "https://loremflickr.com/800/600/kitchen,cleaning,service/all"
        };

        for (let srv of services) {
            let oldImg = srv.image;
            let newImg = oldImg;
            let reason = 'Old image already correctly matches the service description.'

            const cId = srv.categoryId ? srv.categoryId.image.split('?')[0] : '';
            const sId = oldImg ? oldImg.split('?')[0] : '';

            if (customMap[srv.name]) {
                newImg = customMap[srv.name];
                reason = `Specific rule enforced to update to specific service image.`;
            } else if (cId === sId) {
                // It lazily reuses category image
                const terms = srv.name.toLowerCase().replace(/[^a-z0-9]+/g, ',');
                newImg = `https://loremflickr.com/800/600/${terms}/all`;
                reason = `Old image reuses category image. Updated to specific relevant image matching description.`;
            }

            if (newImg !== oldImg) {
                srv.image = newImg;
                await srv.save();
            }

            srvList.push({ name: srv.name, image: newImg });
            if (newImg !== oldImg) {
                log.push({
                    type: 'Service',
                    name: srv.name,
                    old: oldImg,
                    new: newImg,
                    reason: reason
                });
            }
        }

        fs.writeFileSync(__dirname + '/../update_log.json', JSON.stringify({ catList, srvList, log }, null, 2));
        console.log("Update completed and logged to update_log.json");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();

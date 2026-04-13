const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/../.env' });
const Service = require('./models/Service');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const services = await Service.find();

        const updates = {
            "House Wiring": { new: "/assets/images/house_wiring.png", reason: "Replaced unrelated pipe image with professional electrician wiring image." },
            "Ceiling Fan Install": { new: "/assets/images/ceiling_fan_install.png", reason: "Replaced chair image with technician installing ceiling fan." },
            "Gas Refilling": { new: "/assets/images/gas_refilling.png", reason: "Replaced gorilla image with AC refrigerant gas refill photo." },
            "Exhaust Fan Fix": { new: "/assets/images/exhaust_fan_fix.png", reason: "Replaced software/code image with proper technician repairing exhaust fan." },
            "Washing Machine Repair": { new: "/assets/images/washing_machine_repair.png", reason: "Replaced street image with technician repairing washing machine." },
            "TV / Display Repair": { new: "/assets/images/tv_repair.png", reason: "Fixed missing image with LED TV repair technician." },
            "Switchboard Repair": { new: "/assets/images/switchboard_repair.png", reason: "Optional upgrade: specific switchboard repair photo." },
            "Earthing & Testing": { new: "/assets/images/earthing_test.png", reason: "Optional upgrade: electrician performing earthing test." },
            "Water Dispenser Repair": { new: "/assets/images/water_dispenser_repair.png", reason: "Optional upgrade: technician repairing water dispenser." },
            "Water Heater Service": { new: "/assets/images/water_heater_service.png", reason: "Optional upgrade: technician repairing water heater." },
            "Mixer / Grinder Fix": { new: "/assets/images/mixer_grinder_fix.png", reason: "Optional upgrade: technician repairing mixer grinder." }
        };

        const log = [];
        const unchanged = [];
        const replaced = [];

        for (let srv of services) {
            let oldImg = srv.image || "None (Missing)";

            if (updates[srv.name]) {
                const updateInfo = updates[srv.name];
                srv.image = updateInfo.new;
                await srv.save();
                
                replaced.push(srv.name);
                log.push({
                    serviceName: srv.name,
                    oldImage: oldImg,
                    newImage: updateInfo.new,
                    reason: updateInfo.reason
                });
            } else {
                unchanged.push(srv.name);
            }
        }

        fs.writeFileSync(__dirname + '/../final_update_log.json', JSON.stringify({ replaced, unchanged, log }, null, 2));
        console.log("Specific updates completed. Log written to final_update_log.json");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();

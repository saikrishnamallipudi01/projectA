const mongoose = require('mongoose');
const Category = require('./models/Category');
const Service = require('./models/Service');

const MONGO_URI = 'mongodb://localhost:27017/atnis';

const seedServices = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        // Get all existing categories
        const categories = await Category.find();
        console.log(`Found ${categories.length} categories`);

        if (categories.length === 0) {
            console.error('No categories found! Run full seed first.');
            process.exit(1);
        }

        const getCatId = (id) => {
            const cat = categories.find(c => c.id === id);
            if (!cat) { console.warn(`Category "${id}" not found, skipping...`); return null; }
            return cat._id;
        };

        // Clear only services
        await Service.deleteMany();
        console.log('Cleared existing services');

        const servicesData = [
            // NETWORKING
            { categoryId: getCatId('networking'), name: 'LAN / WAN Setup', price: 1200, estimatedTime: '2-3 hrs', description: 'Full wired network installation including switches, patch panels, and end-to-end cabling.', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80', includes: ['Network design & planning', 'Cat6 cabling', 'Switch/router configuration', 'Speed testing & handover'] },
            { categoryId: getCatId('networking'), name: 'Wi-Fi Router Config', price: 500, estimatedTime: '1 hr', description: 'Router setup, firmware updates, strong password configuration and optimal channel selection.', image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=80', includes: ['Router placement advice', 'SSID & password setup', 'Guest network setup', 'Signal testing'] },
            { categoryId: getCatId('networking'), name: 'Network Troubleshoot', price: 400, estimatedTime: '1-2 hrs', description: 'Diagnose and fix slow speeds, dropouts, IP conflicts and connectivity issues.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', includes: ['Full network audit', 'Issue diagnosis', 'Cable & port testing', 'Fix & verify'] },
            { categoryId: getCatId('networking'), name: 'Firewall & Security', price: 1500, estimatedTime: '3 hrs', description: 'Hardware/software firewall setup, intrusion detection, and network segmentation.', image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80', includes: ['Firewall configuration', 'MAC filtering', 'Intrusion detection setup', 'Security report'] },
            { categoryId: getCatId('networking'), name: 'VPN Setup', price: 800, estimatedTime: '1-2 hrs', description: 'Configure secure VPN tunnels for remote work, privacy, and secure communication.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', includes: ['VPN protocol selection', 'Server/client config', 'Kill-switch setup', 'Connection testing'] },
            { categoryId: getCatId('networking'), name: 'Cable Management', price: 700, estimatedTime: '2 hrs', description: 'Professional cable routing, labelling, trunking and rack organisation.', image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80', includes: ['Cable routing plan', 'Trunking installation', 'Labelling', 'Rack organisation'] },

            // ELECTRICAL
            { categoryId: getCatId('electrical'), name: 'House Wiring', price: 2500, estimatedTime: '4-6 hrs', description: 'Complete internal house wiring for new builds or rewiring of existing homes.', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80', includes: ['Load assessment', 'Wire routing & laying', 'Earthing & bonding', 'Safety inspection'] },
            { categoryId: getCatId('electrical'), name: 'DB Board Upgrade', price: 1800, estimatedTime: '3-4 hrs', description: 'Upgrade your distribution board with modern MCBs, RCDs, and surge protectors.', image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80', includes: ['DB assessment', 'MCB/RCD installation', 'Wiring upgrade', 'Load balancing'] },
            { categoryId: getCatId('electrical'), name: 'Switchboard Repair', price: 250, estimatedTime: '30 min', description: 'Fix burnt switches, damaged sockets, faulty MCBs and replace worn-out components.', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80', includes: ['Fault diagnosis', 'Parts replacement', 'Safety check', 'Testing'] },
            { categoryId: getCatId('electrical'), name: 'Ceiling Fan Install', price: 350, estimatedTime: '1 hr', description: 'Install new ceiling fan with proper wiring, regulator fitting and balancing.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Wiring check', 'Mounting & balancing', 'Regulator fitting', 'Test run'] },
            { categoryId: getCatId('electrical'), name: 'Solar Panel Install', price: 8000, estimatedTime: 'Full day', description: 'End-to-end solar panel installation with inverter setup and grid tie-in.', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80', includes: ['Site survey', 'Panel mounting', 'Inverter wiring', 'Grid connection & handover'] },
            { categoryId: getCatId('electrical'), name: 'Earthing & Testing', price: 1200, estimatedTime: '2-3 hrs', description: 'Install and test earthing systems to protect equipment and personnel.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80', includes: ['Earth resistance testing', 'Earth electrode installation', 'Bonding connections', 'Compliance report'] },

            // CCTV / SECURITY
            { categoryId: getCatId('cctv'), name: 'CCTV Installation', price: 3500, estimatedTime: 'Half day', description: 'End-to-end HD CCTV installation with optimal camera placement and remote viewing.', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80', includes: ['Site survey', 'Camera placement', 'HD wiring', 'Remote app setup'] },
            { categoryId: getCatId('cctv'), name: 'DVR / NVR Setup', price: 1200, estimatedTime: '2 hrs', description: 'Configure your DVR/NVR for local and cloud recording and motion alerts.', image: 'https://images.unsplash.com/photo-1572521165329-b197f9ea3da6?w=600&q=80', includes: ['DVR/NVR config', 'HDD formatting', 'Motion alerts', 'Remote access'] },
            { categoryId: getCatId('cctv'), name: 'Camera Maintenance', price: 600, estimatedTime: '1 hr', description: 'Cleaning, realignment, firmware updates and cable inspection for cameras.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', includes: ['Lens cleaning', 'Angle realignment', 'Firmware update', 'Connection test'] },
            { categoryId: getCatId('cctv'), name: 'IP Camera Config', price: 800, estimatedTime: '1-2 hrs', description: 'Network-based IP camera setup with ONVIF compatibility and PoE switch config.', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80', includes: ['IP addressing', 'PoE setup', 'ONVIF config', 'NVR integration'] },
            { categoryId: getCatId('cctv'), name: 'Night Vision Setup', price: 1000, estimatedTime: '2 hrs', description: 'Install and configure IR night vision cameras for darkness surveillance.', image: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=600&q=80', includes: ['IR camera install', 'Night mode config', 'Coverage testing', 'Overlap elimination'] },
            { categoryId: getCatId('cctv'), name: 'Video Door Bell', price: 750, estimatedTime: '1 hr', description: 'Smart doorbell installation with live video, two-way audio and notifications.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Doorbell wiring', 'App integration', 'Wi-Fi config', 'Alert testing'] },

            // AC & COOLING
            { categoryId: getCatId('ac'), name: 'AC Installation', price: 2000, estimatedTime: '3-4 hrs', description: 'Professional split AC installation with proper refrigerant lines and drainage.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', includes: ['Wall bracket mounting', 'Refrigerant piping', 'Electrical connection', 'Trial run & testing'] },
            { categoryId: getCatId('ac'), name: 'AC Service / Cleaning', price: 700, estimatedTime: '1-2 hrs', description: 'Deep cleaning of filters, coils and drainage to restore cooling performance.', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80', includes: ['Filter washing', 'Coil cleaning', 'Drain flush', 'Performance check'] },
            { categoryId: getCatId('ac'), name: 'AC Repair', price: 1300, estimatedTime: '2-3 hrs', description: 'Diagnose and fix all AC problems — compressor issues, water leaks, sensor failures.', image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80', includes: ['Fault diagnosis', 'Part replacement', 'Refrigerant check', 'Test run'] },
            { categoryId: getCatId('ac'), name: 'Gas Refilling', price: 1800, estimatedTime: '2 hrs', description: 'Recharge refrigerant gas after leak detection and pressure testing.', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80', includes: ['Leak detection', 'Pressure test', 'Gas top-up', 'System verification'] },
            { categoryId: getCatId('ac'), name: 'Exhaust Fan Fix', price: 300, estimatedTime: '30 min', description: 'Repair noisy, slow or non-functioning exhaust/ventilation fans.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Fault check', 'Blade/motor service', 'Wiring check', 'Function test'] },
            { categoryId: getCatId('ac'), name: 'Water Dispenser Repair', price: 500, estimatedTime: '1 hr', description: 'Repair cooling/heating issues, leaks and pump faults in water dispensers.', image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&q=80', includes: ['Compressor check', 'Leak fix', 'Thermostat test', 'Sanitisation'] },

            // HARDWARE / IT
            { categoryId: getCatId('hardware'), name: 'PC Assembly', price: 1500, estimatedTime: '2-3 hrs', description: 'Custom PC build — component selection, assembly, cable management and OS install.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', includes: ['Component selection', 'Assembly & cable management', 'BIOS config', 'OS install & drivers'] },
            { categoryId: getCatId('hardware'), name: 'Laptop Repair', price: 800, estimatedTime: '1-3 hrs', description: 'Screen, keyboard, motherboard repair, charging port fix and hinge replacement.', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', includes: ['Diagnosis', 'Parts replacement', 'Cleaning & thermal paste', 'Final testing'] },
            { categoryId: getCatId('hardware'), name: 'Virus Removal', price: 500, estimatedTime: '1-2 hrs', description: 'Full malware, virus and ransomware removal with OS reinstallation if required.', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80', includes: ['Deep scan', 'Malware removal', 'OS repair/reinstall', 'Antivirus setup'] },
            { categoryId: getCatId('hardware'), name: 'RAM / SSD Upgrade', price: 600, estimatedTime: '1 hr', description: 'Upgrade RAM or replace HDD with SSD for a major speed boost.', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80', includes: ['Compatibility check', 'Component installation', 'Data migration', 'Speed benchmarking'] },
            { categoryId: getCatId('hardware'), name: 'Printer Setup', price: 400, estimatedTime: '1 hr', description: 'Install, configure and troubleshoot printers including network printing.', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80', includes: ['Driver install', 'Network config', 'Test print', 'Ink/toner guidance'] },
            { categoryId: getCatId('hardware'), name: 'Data Recovery', price: 2000, estimatedTime: '2-4 hrs', description: 'Recover lost files from crashed drives, formatted storage and corrupted USBs.', image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80', includes: ['Drive analysis', 'File extraction', 'Backup to new media', 'Success report'] },

            // HOME APPLIANCES
            { categoryId: getCatId('appliances'), name: 'Washing Machine Repair', price: 900, estimatedTime: '1-2 hrs', description: 'Diagnose and repair washing machine faults — drum, motor, board and leaks.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Fault diagnosis', 'Parts replacement', 'Drum/motor check', 'Test wash cycle'] },
            { categoryId: getCatId('appliances'), name: 'Refrigerator Repair', price: 1100, estimatedTime: '1-2 hrs', description: 'Fix cooling issues, gas leaks, compressor faults and door seal replacements.', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80', includes: ['Cooling diagnosis', 'Compressor check', 'Gas top-up', 'Temperature testing'] },
            { categoryId: getCatId('appliances'), name: 'Microwave Repair', price: 600, estimatedTime: '1 hr', description: 'Repair microwave heating issues, door faults and control board errors.', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80', includes: ['Power & heating test', 'Magnetron check', 'Door mechanism fix', 'Safety test'] },
            { categoryId: getCatId('appliances'), name: 'TV / Display Repair', price: 1200, estimatedTime: '1-3 hrs', description: 'Screen, backlight, HDMI port and power board repair for LED/LCD TVs.', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=80', includes: ['Display diagnosis', 'Board/backlight repair', 'Port & remote check', 'Picture calibration'] },
            { categoryId: getCatId('appliances'), name: 'Water Heater Service', price: 500, estimatedTime: '1 hr', description: 'Service and repair electric geysers — element replacement and safety valve check.', image: 'https://images.unsplash.com/photo-1604014237256-11d475e2a2d8?w=600&q=80', includes: ['Element check', 'Thermostat test', 'Safety valve inspection', 'Leak check'] },
            { categoryId: getCatId('appliances'), name: 'Mixer / Grinder Fix', price: 350, estimatedTime: '45 min', description: 'Repair motor, blades, jars and wiring faults on all types of mixers.', image: 'https://images.unsplash.com/photo-1591689937610-7b783dba93a4?w=600&q=80', includes: ['Motor check', 'Blade/jar fix', 'Wiring repair', 'Function test'] },

            // MECHANICAL
            { categoryId: getCatId('mechanical'), name: 'Plumbing Repair', price: 600, estimatedTime: '1-2 hrs', description: 'Fix leaking pipes, broken taps, blocked drains and faulty flush systems.', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80', includes: ['Leak detection', 'Pipe repair/replace', 'Drain unblocking', 'Pressure test'] },
            { categoryId: getCatId('mechanical'), name: 'Bathroom Fitting', price: 1500, estimatedTime: '3-4 hrs', description: 'Install showers, wash basins, commodes and accessories with proper sealing.', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', includes: ['Fitting selection advice', 'Installation', 'Sealing & waterproofing', 'Water flow test'] },
            { categoryId: getCatId('mechanical'), name: 'Motor Pump Service', price: 900, estimatedTime: '2 hrs', description: 'Service, repair or replace water pump motors for tanks and borewells.', image: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=600&q=80', includes: ['Motor diagnosis', 'Winding check', 'Capacitor replacement', 'Flow test'] },
            { categoryId: getCatId('mechanical'), name: 'Door / Lock Repair', price: 400, estimatedTime: '1 hr', description: 'Repair or replace door locks, hinges, handles and rolling shutters.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Lock mechanism check', 'Hinge alignment', 'Parts replacement', 'Smooth operation test'] },
            { categoryId: getCatId('mechanical'), name: 'Tile / Grout Fix', price: 800, estimatedTime: '2-3 hrs', description: 'Replace cracked tiles, regrout bathroom and kitchen joints.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', includes: ['Tile removal', 'New tile laying', 'Grouting & sealing', 'Finish polishing'] },
            { categoryId: getCatId('mechanical'), name: 'False Ceiling Work', price: 3500, estimatedTime: 'Full day', description: 'Design and install POP or gypsum false ceilings with integrated lighting.', image: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=600&q=80', includes: ['Design consultation', 'Frame installation', 'Board fixing', 'Finish & paint'] },

            // SMART HOME
            { categoryId: getCatId('smart'), name: 'Smart Lighting Setup', price: 1500, estimatedTime: '2-3 hrs', description: 'Install smart LED bulbs, strips and switches with app/voice control.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Bulb/switch install', 'App pairing', 'Scene configuration', 'Voice assistant link'] },
            { categoryId: getCatId('smart'), name: 'Smart Lock Install', price: 2000, estimatedTime: '1-2 hrs', description: 'Install and configure fingerprint, pin or app-controlled smart door locks.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', includes: ['Lock mounting', 'App setup & pairing', 'User fingerprint enroll', 'Remote access config'] },
            { categoryId: getCatId('smart'), name: 'Home Automation Hub', price: 3500, estimatedTime: 'Half day', description: 'Set up a central smart home hub linking all devices.', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80', includes: ['Hub placement', 'Device discovery & pairing', 'Routine programming', 'User training'] },
            { categoryId: getCatId('smart'), name: 'Smart TV Setup', price: 600, estimatedTime: '1 hr', description: 'Android/Apple TV box setup, Wi-Fi optimisation and streaming app config.', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=80', includes: ['TV/box config', 'Wi-Fi & streaming setup', 'App installs', 'Remote programming'] },
            { categoryId: getCatId('smart'), name: 'CCTV + Smart Alert', price: 2500, estimatedTime: '3-4 hrs', description: 'Combine smart cameras with motion-triggered mobile alerts and cloud backup.', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80', includes: ['Camera install', 'Smart alert config', 'Cloud backup setup', 'App integration'] },
            { categoryId: getCatId('smart'), name: 'Smart Irrigation', price: 1800, estimatedTime: '2-3 hrs', description: 'Install automated garden watering systems with soil sensors and timers.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', includes: ['Pipe & sprinkler layout', 'Sensor installation', 'Timer/app config', 'Test run'] },
        ];

        // Filter out services with null categoryId (missing categories)
        const validServices = servicesData.filter(s => s.categoryId !== null);
        console.log(`Inserting ${validServices.length} services (${servicesData.length - validServices.length} skipped due to missing categories)...`);

        await Service.insertMany(validServices);

        // Verify
        const count = await Service.countDocuments();
        console.log(`\n✅ Done! ${count} services now in database.`);

        // Show count per category
        for (const cat of categories) {
            const svcCount = await Service.countDocuments({ categoryId: cat._id });
            console.log(`   ${cat.icon} ${cat.name}: ${svcCount} services`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

seedServices();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const Service = require('./models/Service');
const Technician = require('./models/Technician');

const path = require('path');
// Prioritize root .env, then fallback to local .env in backend/
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.MONGO_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing
        await User.deleteMany();
        await Category.deleteMany();
        await Service.deleteMany();
        await Technician.deleteMany();

        // 1. Seed Users
        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('admin123', salt);
        const hashedServicePointPassword = await bcrypt.hash('servicepoint123', salt);
        const hashedCustomerPassword = await bcrypt.hash('customer123', salt);

        await User.insertMany([
            {
                name: 'Mallipudi Sai Krishna',
                email: 'saikrishna@atnis.in',
                phone: '9876543200',
                password: hashedAdminPassword,
                role: 'Admin',
            },
            {
                name: 'Demo ServicePoint',
                email: 'demo@atnis.in',
                phone: '1234567890',
                password: hashedServicePointPassword,
                role: 'ServicePoint',
            },
            {
                name: 'Main Customer Center',
                email: 'customer@atnis.in',
                phone: '9988776655',
                password: hashedCustomerPassword,
                role: 'Customer',
            },
            {
                name: 'Sai ServicePoint',
                email: 'sai01@gmail.com',
                phone: '9876543210',
                password: await bcrypt.hash('123456', 10),
                role: 'ServicePoint',
            },
        ]);

        // 2. Seed Categories
        const categoriesData = [
            {
                id: 'networking',
                name: 'Networking',
                icon: '🌐',
                color: '#3b82f6',
                tagline: 'High-speed, secure network infrastructure for offices, homes & shops.',
                image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
                order: 1
            },
            {
                id: 'electrical',
                name: 'Electrical',
                icon: '⚡',
                color: '#eab308',
                tagline: 'Licensed electricians for safe, certified electrical work.',
                image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
                order: 2
            },
            {
                id: 'cctv',
                name: 'CCTV / Security',
                icon: '📹',
                color: '#ef4444',
                tagline: 'Professional CCTV & Security Solutions for homes and businesses.',
                image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
                order: 3
            },
            {
                id: 'ac',
                name: 'AC & Cooling',
                icon: '❄️',
                color: '#0ea5e9',
                tagline: 'Expert HVAC services to keep you cool year-round.',
                image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
                order: 4
            },
            {
                id: 'hardware',
                name: 'Hardware / IT',
                icon: '💻',
                color: '#8b5cf6',
                tagline: 'Fast and reliable computer & laptop repair services.',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
                order: 5
            },
            {
                id: 'appliances',
                name: 'Home Appliances',
                icon: '📺',
                color: '#f97316',
                tagline: 'Authorised appliance repair for all major brands.',
                image: 'https://images.unsplash.com/photo-1626806787461-102c1a7f1b7b?w=800&q=80',
                order: 6
            },
            {
                id: 'mechanical',
                name: 'Mechanical',
                icon: '⚙️',
                color: '#64748b',
                tagline: 'Heavy-duty mechanical & electrical engineering services.',
                image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
                order: 7
            },
            {
                id: 'smart',
                name: 'Smart Home',
                icon: '🏠',
                color: '#10b981',
                tagline: 'Transform your home into a smart, connected ecosystem.',
                image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80',
                order: 8
            },
            {
                id: 'agriculture',
                name: 'Agriculture',
                icon: '🚜',
                color: '#10b981',
                tagline: 'Technical solutions and machinery for modern farming.',
                image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c6c06?w=800&q=80',
                order: 9
            },
        ];
        const categories = await Category.insertMany(categoriesData);

        const getCatId = (id) => categories.find((c) => c.id === id)._id;

        // 3. Seed Services — exact services from the screenshots
        const servicesData = [

            // ── NETWORKING ──────────────────────────────────────────────
            {
                categoryId: getCatId('networking'),
                name: 'LAN / WAN Setup',
                price: 1200,
                estimatedTime: '2-3 hrs',
                description: 'Full wired network installation including switches, patch panels, and end-to-end cabling. Ideal for offices, shops, and multi-room homes.',
                image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
                includes: ['Network design & planning', 'Cat6 cabling', 'Switch/router configuration', 'Speed testing & handover']
            },
            {
                categoryId: getCatId('networking'),
                name: 'Wi-Fi Router Config',
                price: 500,
                estimatedTime: '1 hr',
                description: 'Router setup, firmware updates, strong password configuration and optimal channel selection for maximum coverage.',
                image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=80',
                includes: ['Router placement advice', 'SSID & password setup', 'Guest network setup', 'Signal testing']
            },
            {
                categoryId: getCatId('networking'),
                name: 'Network Troubleshoot',
                price: 400,
                estimatedTime: '1-2 hrs',
                description: 'Diagnose and fix slow speeds, dropouts, IP conflicts and connectivity issues across your entire network.',
                image: 'https://loremflickr.com/800/600/network,rack,technician/all',
                includes: ['Full network audit', 'Issue diagnosis', 'Cable & port testing', 'Fix & verify']
            },
            {
                categoryId: getCatId('networking'),
                name: 'Firewall & Security',
                price: 1500,
                estimatedTime: '3 hrs',
                description: 'Hardware/software firewall setup, intrusion detection, and network segmentation to keep your data safe.',
                image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80',
                includes: ['Firewall configuration', 'MAC filtering', 'Intrusion detection setup', 'Security report']
            },
            {
                categoryId: getCatId('networking'),
                name: 'VPN Setup',
                price: 800,
                estimatedTime: '1-2 hrs',
                description: 'Configure secure VPN tunnels for remote work, privacy, and secure inter-branch communication.',
                image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
                includes: ['VPN protocol selection', 'Server/client config', 'Kill-switch setup', 'Connection testing']
            },
            {
                categoryId: getCatId('networking'),
                name: 'Cable Management',
                price: 700,
                estimatedTime: '2 hrs',
                description: 'Professional cable routing, labelling, trunking and rack organisation for a clean and maintainable setup.',
                image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80',
                includes: ['Cable routing plan', 'Trunking installation', 'Labelling', 'Rack organisation']
            },

            // ── ELECTRICAL ───────────────────────────────────────────────
            {
                categoryId: getCatId('electrical'),
                name: 'House Wiring',
                price: 2500,
                estimatedTime: '4-6 hrs',
                description: 'Complete internal house wiring for new builds or rewiring of existing homes to meet safety standards.',
                image: '/assets/images/house_wiring.png',
                includes: ['Load assessment', 'Wire routing & laying', 'Earthing & bonding', 'Safety inspection']
            },
            {
                categoryId: getCatId('electrical'),
                name: 'DB Board Upgrade',
                price: 1800,
                estimatedTime: '3-4 hrs',
                description: 'Upgrade your distribution board with modern MCBs, RCDs, and surge protectors for safer power distribution.',
                image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80',
                includes: ['DB assessment', 'MCB/RCD installation', 'Wiring upgrade', 'Load balancing']
            },
            {
                categoryId: getCatId('electrical'),
                name: 'Switchboard Repair',
                price: 250,
                estimatedTime: '30 min',
                description: 'Fix burnt switches, damaged sockets, faulty MCBs and replace worn-out switchboard components.',
                image: '/assets/images/switchboard_repair.png',
                includes: ['Fault diagnosis', 'Parts replacement (extra charge)', 'Safety check', 'Testing']
            },
            {
                categoryId: getCatId('electrical'),
                name: 'Ceiling Fan Install',
                price: 350,
                estimatedTime: '1 hr',
                description: 'Install new ceiling fan with proper wiring, regulator fitting and balancing for smooth operation.',
                image: '/assets/images/ceiling_fan_install.png',
                includes: ['Wiring check', 'Mounting & balancing', 'Regulator fitting', 'Test run']
            },
            {
                categoryId: getCatId('electrical'),
                name: 'Solar Panel Install',
                price: 8000,
                estimatedTime: 'Full day',
                description: 'End-to-end solar panel installation with inverter setup, battery bank wiring and grid tie-in.',
                image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
                includes: ['Site survey', 'Panel mounting', 'Inverter wiring', 'Grid connection & handover']
            },
            {
                categoryId: getCatId('electrical'),
                name: 'Earthing & Testing',
                price: 1200,
                estimatedTime: '2-3 hrs',
                description: 'Install and test earthing systems to protect equipment and personnel from electrical faults.',
                image: '/assets/images/earthing_test.png',
                includes: ['Earth resistance testing', 'Earth electrode installation', 'Bonding connections', 'Compliance report']
            },

            // ── CCTV / SECURITY ──────────────────────────────────────────
            {
                categoryId: getCatId('cctv'),
                name: 'CCTV Installation',
                price: 3500,
                estimatedTime: 'Half day',
                description: 'End-to-end HD CCTV installation with optimal camera placement, cabling and remote viewing setup.',
                image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80',
                includes: ['Site survey', 'Camera placement', 'HD wiring', 'Remote app setup']
            },
            {
                categoryId: getCatId('cctv'),
                name: 'DVR / NVR Setup',
                price: 1200,
                estimatedTime: '2 hrs',
                description: 'Configure your DVR/NVR for local and cloud recording, motion alerts and scheduled recording.',
                image: 'https://images.unsplash.com/photo-1572521165329-b197f9ea3da6?w=600&q=80',
                includes: ['DVR/NVR config', 'HDD formatting', 'Motion alerts', 'Remote access']
            },
            {
                categoryId: getCatId('cctv'),
                name: 'Camera Maintenance',
                price: 600,
                estimatedTime: '1 hr',
                description: 'Cleaning, realignment, firmware updates and cable inspection for existing cameras.',
                image: 'https://loremflickr.com/800/600/camera,lens,cleaning/all',
                includes: ['Lens cleaning', 'Angle realignment', 'Firmware update', 'Connection test']
            },
            {
                categoryId: getCatId('cctv'),
                name: 'IP Camera Config',
                price: 800,
                estimatedTime: '1-2 hrs',
                description: 'Network-based IP camera setup with ONVIF compatibility, static IP and PoE switch configuration.',
                image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80',
                includes: ['IP addressing', 'PoE setup', 'ONVIF config', 'NVR integration']
            },
            {
                categoryId: getCatId('cctv'),
                name: 'Night Vision Setup',
                price: 1000,
                estimatedTime: '2 hrs',
                description: 'Install and configure IR night vision cameras for complete darkness surveillance coverage.',
                image: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=600&q=80',
                includes: ['IR camera install', 'Night mode config', 'Coverage testing', 'Overlap elimination']
            },
            {
                categoryId: getCatId('cctv'),
                name: 'Video Door Bell',
                price: 750,
                estimatedTime: '1 hr',
                description: 'Smart doorbell installation with live video, two-way audio and mobile notifications.',
                image: 'https://loremflickr.com/800/600/smart,video,doorbell/all',
                includes: ['Doorbell wiring', 'App integration', 'Wi-Fi config', 'Alert testing']
            },

            // ── AC & COOLING ─────────────────────────────────────────────
            {
                categoryId: getCatId('ac'),
                name: 'AC Installation',
                price: 2000,
                estimatedTime: '3-4 hrs',
                description: 'Professional split AC installation with proper refrigerant lines, electrical connections and drainage.',
                image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
                includes: ['Wall bracket mounting', 'Refrigerant piping', 'Electrical connection', 'Trial run & testing']
            },
            {
                categoryId: getCatId('ac'),
                name: 'AC Service / Cleaning',
                price: 700,
                estimatedTime: '1-2 hrs',
                description: 'Deep cleaning of filters, coils and drainage to restore cooling performance and improve air quality.',
                image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
                includes: ['Filter washing', 'Coil cleaning', 'Drain flush', 'Performance check']
            },
            {
                categoryId: getCatId('ac'),
                name: 'AC Repair',
                price: 1300,
                estimatedTime: '2-3 hrs',
                description: 'Diagnose and fix all AC problems — compressor issues, water leaks, remote faults and sensor failures.',
                image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600&q=80',
                includes: ['Fault diagnosis', 'Part replacement', 'Refrigerant check', 'Test run']
            },
            {
                categoryId: getCatId('ac'),
                name: 'Gas Refilling',
                price: 1800,
                estimatedTime: '2 hrs',
                description: 'Recharge refrigerant gas (R22/R32/R410A) after leak detection and pressure testing.',
                image: '/assets/images/gas_refilling.png',
                includes: ['Leak detection', 'Pressure test', 'Gas top-up', 'System verification']
            },
            {
                categoryId: getCatId('ac'),
                name: 'Exhaust Fan Fix',
                price: 300,
                estimatedTime: '30 min',
                description: 'Repair noisy, slow or non-functioning exhaust/ventilation fans in bathrooms and kitchens.',
                image: '/assets/images/exhaust_fan_fix.png',
                includes: ['Fault check', 'Blade/motor service', 'Wiring check', 'Function test']
            },
            {
                categoryId: getCatId('ac'),
                name: 'Water Dispenser Repair',
                price: 500,
                estimatedTime: '1 hr',
                description: 'Repair cooling/heating issues, leaks and pump faults in office and home water dispensers.',
                image: '/assets/images/water_dispenser_repair.png',
                includes: ['Compressor check', 'Leak fix', 'Thermostat test', 'Sanitisation']
            },

            // ── HARDWARE / IT ────────────────────────────────────────────
            {
                categoryId: getCatId('hardware'),
                name: 'PC Assembly',
                price: 1500,
                estimatedTime: '2-3 hrs',
                description: 'Custom PC build from scratch — component selection, assembly, cable management and OS installation.',
                image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
                includes: ['Component selection', 'Assembly & cable management', 'BIOS config', 'OS install & drivers']
            },
            {
                categoryId: getCatId('hardware'),
                name: 'Laptop Repair',
                price: 800,
                estimatedTime: '1-3 hrs',
                description: 'Screen replacement, keyboard, motherboard repair, charging port fix and hinge replacement for all brands.',
                image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
                includes: ['Diagnosis', 'Parts replacement (cost extra)', 'Cleaning & thermal paste', 'Final testing']
            },
            {
                categoryId: getCatId('hardware'),
                name: 'Virus Removal',
                price: 500,
                estimatedTime: '1-2 hrs',
                description: 'Full malware, virus and ransomware removal with reinstallation of OS if required.',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
                includes: ['Deep scan', 'Malware removal', 'OS repair/reinstall', 'Antivirus setup']
            },
            {
                categoryId: getCatId('hardware'),
                name: 'RAM / SSD Upgrade',
                price: 600,
                estimatedTime: '1 hr',
                description: 'Upgrade RAM or replace HDD with SSD for a major speed boost on any desktop or laptop.',
                image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
                includes: ['Compatibility check', 'Component installation', 'Data migration', 'Speed benchmarking']
            },
            {
                categoryId: getCatId('hardware'),
                name: 'Printer Setup',
                price: 400,
                estimatedTime: '1 hr',
                description: 'Install, configure and troubleshoot inkjet or laser printers including network printing setup.',
                image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80',
                includes: ['Driver install', 'Network config', 'Test print', 'Ink/toner guidance']
            },
            {
                categoryId: getCatId('hardware'),
                name: 'Data Recovery',
                price: 2000,
                estimatedTime: '2-4 hrs',
                description: 'Recover lost files from crashed drives, formatted storage and corrupted USB drives.',
                image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80',
                includes: ['Drive analysis', 'File extraction', 'Backup to new media', 'Success report']
            },

            // ── HOME APPLIANCES ──────────────────────────────────────────
            {
                categoryId: getCatId('appliances'),
                name: 'Washing Machine Repair',
                price: 900,
                estimatedTime: '1-2 hrs',
                description: 'Diagnose and repair front-load or top-load washing machine faults — drum, motor, board and leaks.',
                image: '/assets/images/washing_machine_repair.png',
                includes: ['Fault diagnosis', 'Parts replacement', 'Drum/motor check', 'Test wash cycle']
            },
            {
                categoryId: getCatId('appliances'),
                name: 'Refrigerator Repair',
                price: 1100,
                estimatedTime: '1-2 hrs',
                description: 'Fix cooling issues, gas leaks, compressor faults, thermostat problems and door seal replacements.',
                image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
                includes: ['Cooling diagnosis', 'Compressor check', 'Gas top-up (if needed)', 'Temperature testing']
            },
            {
                categoryId: getCatId('appliances'),
                name: 'Microwave Repair',
                price: 600,
                estimatedTime: '1 hr',
                description: 'Repair microwave heating issues, door faults, turntable problems and control board errors.',
                image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80',
                includes: ['Power & heating test', 'Magnetron check', 'Door mechanism fix', 'Safety test']
            },
            {
                categoryId: getCatId('appliances'),
                name: 'TV / Display Repair',
                price: 1200,
                estimatedTime: '1-3 hrs',
                description: 'Screen, backlight, HDMI port and power board repair for LED/LCD TVs of all brands.',
                image: '/assets/images/tv_repair.png',
                includes: ['Display diagnosis', 'Board/backlight repair', 'Port & remote check', 'Picture calibration']
            },
            {
                categoryId: getCatId('appliances'),
                name: 'Water Heater Service',
                price: 500,
                estimatedTime: '1 hr',
                description: 'Service and repair electric geysers — element replacement, thermostat fix and safety valve check.',
                image: '/assets/images/water_heater_service.png',
                includes: ['Element check', 'Thermostat test', 'Safety valve inspection', 'Leak check']
            },
            {
                categoryId: getCatId('appliances'),
                name: 'Mixer / Grinder Fix',
                price: 350,
                estimatedTime: '45 min',
                description: 'Repair motor, blades, jars and wiring faults on all types of mixers and wet grinders.',
                image: '/assets/images/mixer_grinder_fix.png',
                includes: ['Motor check', 'Blade/jar fix', 'Wiring repair', 'Function test']
            },

            // ── MECHANICAL ───────────────────────────────────────────────
            {
                categoryId: getCatId('mechanical'),
                name: 'Plumbing Repair',
                price: 600,
                estimatedTime: '1-2 hrs',
                description: 'Fix leaking pipes, broken taps, blocked drains and faulty flush systems quickly and cleanly.',
                image: 'https://source.unsplash.com/800x600/?plumber%2Cfixing%2Cpipe%2Cleakage%2Cplumbing%2Crepair%2Cunder%2Csink',
                includes: ['Leak detection', 'Pipe repair/replace', 'Drain unblocking', 'Pressure test']
            },
            {
                categoryId: getCatId('mechanical'),
                name: 'Bathroom Fitting',
                price: 1500,
                estimatedTime: '3-4 hrs',
                description: 'Install showers, wash basins, commodes, water heaters and accessories with proper sealing.',
                image: 'https://source.unsplash.com/800x600/?bathroom%2Cfitting%2Cinstallation%2Cplumber',
                includes: ['Fitting selection advice', 'Installation', 'Sealing & waterproofing', 'Water flow test']
            },
            {
                categoryId: getCatId('mechanical'),
                name: 'Motor Pump Service',
                price: 900,
                estimatedTime: '2 hrs',
                description: 'Service, repair or replace water pump motors for overhead tanks, borewells and sump pumps.',
                image: 'https://source.unsplash.com/800x600/?water%2Cpump%2Crepair%2Ctechnician%2Cmotor%2Cpump%2Cservice%2Crepair',
                includes: ['Motor diagnosis', 'Winding check', 'Capacitor replacement', 'Flow test']
            },
            {
                categoryId: getCatId('mechanical'),
                name: 'Door / Lock Repair',
                price: 400,
                estimatedTime: '1 hr',
                description: 'Repair or replace door locks, hinges, handles, sliding tracks and rolling shutters.',
                image: 'https://source.unsplash.com/800x600/?door%2Clock%2Crepair%2Ctechnician%2Clocksmith%2Cfixing%2Cdoor%2Clock',
                includes: ['Lock mechanism check', 'Hinge alignment', 'Parts replacement', 'Smooth operation test']
            },
            {
                categoryId: getCatId('mechanical'),
                name: 'Tile / Grout Fix',
                price: 800,
                estimatedTime: '2-3 hrs',
                description: 'Replace cracked tiles, regrout bathroom and kitchen joints to prevent water seepage.',
                image: 'https://source.unsplash.com/800x600/?tile%2Cinstallation%2Cworker%2Cgrout%2Cfixing',
                includes: ['Tile removal', 'New tile laying', 'Grouting & sealing', 'Finish polishing']
            },
            {
                categoryId: getCatId('mechanical'),
                name: 'False Ceiling Work',
                price: 3500,
                estimatedTime: 'Full day',
                description: 'Design and install POP or gypsum false ceilings with integrated lighting and finishing.',
                image: 'https://source.unsplash.com/800x600/?false%2Cceiling%2Cinstallation%2Cgypsum%2Cworkers',
                includes: ['Design consultation', 'Frame installation', 'Board fixing', 'Finish & paint']
            },

            // ── SMART HOME ───────────────────────────────────────────────
            {
                categoryId: getCatId('smart'),
                name: 'Smart Lighting Setup',
                price: 1500,
                estimatedTime: '2-3 hrs',
                description: 'Install smart LED bulbs, strips and switches with app/voice control via Alexa or Google Home.',
                image: 'https://source.unsplash.com/800x600/?smart%2Clighting%2Cinstallation%2Ctechnician',
                includes: ['Bulb/switch install', 'App pairing', 'Scene configuration', 'Voice assistant link']
            },
            {
                categoryId: getCatId('smart'),
                name: 'Smart Lock Install',
                price: 2000,
                estimatedTime: '1-2 hrs',
                description: 'Install and configure fingerprint, pin or app-controlled smart door locks with remote access.',
                image: 'https://source.unsplash.com/800x600/?smart%2Cdoor%2Clock%2Cinstallation%2Ctechnician',
                includes: ['Lock mounting', 'App setup & pairing', 'User fingerprint enroll', 'Remote access config']
            },
            {
                categoryId: getCatId('smart'),
                name: 'Home Automation Hub',
                price: 3500,
                estimatedTime: 'Half day',
                description: 'Set up a central smart home hub (Google Home, Amazon Echo, Home Assistant) linking all devices.',
                image: 'https://source.unsplash.com/800x600/?smart%2Chome%2Cautomation%2Csetup%2Ctechnician',
                includes: ['Hub placement', 'Device discovery & pairing', 'Routine programming', 'User training']
            },
            {
                categoryId: getCatId('smart'),
                name: 'Smart TV Setup',
                price: 600,
                estimatedTime: '1 hr',
                description: 'Android/Apple TV box setup, Wi-Fi optimisation, streaming app configuration and remote pairing.',
                image: 'https://source.unsplash.com/800x600/?TV%2Cwall%2Cmount%2Cinstallation%2Ctechnician',
                includes: ['TV/box config', 'Wi-Fi & streaming setup', 'App installs', 'Remote programming']
            },
            {
                categoryId: getCatId('smart'),
                name: 'CCTV + Smart Alert',
                price: 2500,
                estimatedTime: '3-4 hrs',
                description: 'Combine smart cameras with motion-triggered mobile alerts, night mode and cloud backup.',
                image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80',
                includes: ['Camera install', 'Smart alert config', 'Cloud backup setup', 'App integration']
            },
            {
                categoryId: getCatId('smart'),
                name: 'Smart Irrigation',
                price: 1800,
                estimatedTime: '2-3 hrs',
                description: 'Install automated garden watering systems with soil sensors, timers and app control.',
                image: 'https://source.unsplash.com/800x600/?smart%2Cirrigation%2Csystem%2Cgarden%2Csprinklers',
                includes: ['Pipe & sprinkler layout', 'Sensor installation', 'Timer/app config', 'Test run']
            },

            // ── AGRICULTURE ──────────────────────────────────────────────
            {
                categoryId: getCatId('agriculture'),
                name: 'Tractor Renting',
                price: 2500,
                estimatedTime: 'Per Day',
                description: 'Rent a premium tractor with a driver for plowing or transporting goods.',
                image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c6c06?w=600&q=80',
                includes: ['Tractor with fuel', 'Experienced Driver', 'Maintenance Support']
            },
            {
                categoryId: getCatId('agriculture'),
                name: 'Crop Harvesting',
                price: 5000,
                estimatedTime: 'Per Acre',
                description: 'Efficient machine harvesting for heavy crops like wheat and paddy.',
                image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=600&q=80',
                includes: ['Harvester machine', 'Worker', 'Crop Transport to Farmhouse']
            },
            {
                categoryId: getCatId('agriculture'),
                name: 'Pesticide Spraying',
                price: 1500,
                estimatedTime: '2-4 hrs',
                description: 'Professional pesticide and fertilizer spraying using drones or manual pumps.',
                image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&q=80',
                includes: ['Spraying equipment provided', 'Safety gear for workers', 'Complete coverage']
            },
        ];

        await Service.insertMany(servicesData);

        // 4. Seed Technicians
        const techsData = [
            {
                name: 'Ravi Kumar Naidu',
                role: 'Networking/Hardware Expert',
                phone: '9876540001',
                location: 'Old Town',
                distanceKm: 1.2,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('networking'), getCatId('hardware')],
                experience: '5 Years',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
            },
            {
                name: 'Suresh Babu Rao',
                role: 'Networking Technician',
                phone: '9876540002',
                location: 'Bommuru',
                distanceKm: 2.8,
                rating: 4.7,
                status: 'available',
                categories: [getCatId('networking'), getCatId('agriculture')],
                experience: '3 Years',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
            },
            {
                name: 'Venkat Raju Pillai',
                role: 'Master Electrician',
                phone: '9876540003',
                location: 'Jagannaickpur',
                distanceKm: 0.9,
                rating: 4.8,
                status: 'available',
                categories: [getCatId('electrical')],
                experience: '8 Years',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
            },
            {
                name: 'Srinivasa Murthy',
                role: 'Electrical & Mechanical Tech',
                phone: '9876540004',
                location: 'Gandhinagar',
                distanceKm: 3.5,
                rating: 4.6,
                status: 'busy',
                categories: [getCatId('electrical'), getCatId('mechanical')],
                experience: '4 Years',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'
            },
            {
                name: 'Kiran Prasad Gadde',
                role: 'CCTV Specialist',
                phone: '9876540005',
                location: 'Suryaraopeta',
                distanceKm: 1.7,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('cctv'), getCatId('smart')],
                experience: '6 Years',
                avatar: 'https://images.unsplash.com/photo-1542178243-bc20204babc0?w=400&q=80'
            },
            {
                name: 'Nagarjuna Reddy',
                role: 'AC Technician',
                phone: '9876540006',
                location: 'Durgannagar',
                distanceKm: 2.1,
                rating: 4.7,
                status: 'available',
                categories: [getCatId('ac')],
                experience: '4 Years',
                avatar: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80'
            },
            {
                name: 'Lokesh Chandra Sekhar',
                role: 'IT Hardware Expert',
                phone: '9876540007',
                location: 'Ramanayyapeta',
                distanceKm: 1.4,
                rating: 4.8,
                status: 'available',
                categories: [getCatId('hardware')],
                experience: '5 Years',
                avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80'
            },
            {
                name: 'Prakash Yadav',
                role: 'Appliance Repair Specialist',
                phone: '9876540008',
                location: 'Nathavaram',
                distanceKm: 4.2,
                rating: 4.6,
                status: 'busy',
                categories: [getCatId('appliances')],
                experience: '7 Years',
                avatar: 'https://images.unsplash.com/photo-1504257426162-d61081691122?w=400&q=80'
            },
            {
                name: 'Aravind Kumar Polu',
                role: 'Mechanical Engineer',
                phone: '9876540009',
                location: 'Pithapuram Road',
                distanceKm: 3.0,
                rating: 5.0,
                status: 'available',
                categories: [getCatId('mechanical'), getCatId('electrical')],
                experience: '10 Years',
                avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80'
            },
            {
                name: 'Venkata Ramana',
                role: 'Smart Home Expert',
                phone: '9876540010',
                location: 'Beach Road',
                distanceKm: 1.0,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('smart'), getCatId('cctv')],
                experience: '4 Years',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
            },
            {
                name: 'Anand Varma',
                role: 'AC & Appliances Expert',
                phone: '9876540011',
                location: 'Collectorate',
                distanceKm: 1.5,
                rating: 4.8,
                status: 'available',
                categories: [getCatId('ac'), getCatId('appliances')],
                experience: '6 Years',
                avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80'
            },
            {
                name: 'Sita Ram',
                role: 'Networking Specialist',
                phone: '9876540012',
                location: 'Kacheripeta',
                distanceKm: 2.2,
                rating: 4.7,
                status: 'busy',
                categories: [getCatId('networking'), getCatId('cctv')],
                experience: '5 Years',
                avatar: 'https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?w=400&q=80'
            },
            {
                name: 'Bhanu Prakash',
                role: 'General Electrician',
                phone: '9876540013',
                location: 'Main Road',
                distanceKm: 0.8,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('electrical')],
                experience: '9 Years',
                avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&q=80'
            },
            {
                name: 'Madhuvu Kumar',
                role: 'Mechanical Expert',
                phone: '9876540014',
                location: 'Temple St',
                distanceKm: 1.9,
                rating: 4.8,
                status: 'available',
                categories: [getCatId('mechanical'), getCatId('electrical')],
                experience: '7 Years',
                avatar: 'https://images.unsplash.com/photo-1520341280432-4749d4d7bcf9?w=400&q=80'
            },
            {
                name: 'Rajesh Kumar',
                role: 'Smart Home Specialist',
                phone: '9876540015',
                location: 'Cinema St',
                distanceKm: 1.3,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('smart'), getCatId('hardware')],
                experience: '6 Years',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80'
            }
        ];
        await Technician.insertMany(techsData);

        console.log(`✅ Seed Data Inserted Successfully — ${categoriesData.length} categories, ${servicesData.length} services, ${techsData.length} technicians!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();

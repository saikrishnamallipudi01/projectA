const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Category = require('./models/Category');
const Service = require('./models/Service');
const Technician = require('./models/Technician');

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateToAtlas = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to Atlas.');

        // 1. Clear existing data
        console.log('Clearing existing data in Atlas...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Service.deleteMany({}),
            Technician.deleteMany({})
        ]);
        console.log('Existing data cleared.');

        // 2. Load and seed from db_dump.json
        const dumpPath = path.join(__dirname, '../db_dump.json');
        if (fs.existsSync(dumpPath)) {
            console.log('Reading db_dump.json...');
            const dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

            if (dumpData.categories) {
                console.log(`Seeding ${dumpData.categories.length} categories...`);
                await Category.insertMany(dumpData.categories);
            }

            if (dumpData.services) {
                console.log(`Seeding ${dumpData.services.length} services...`);
                // Fix services that might have nested category objects instead of IDs
                const processedServices = dumpData.services.map(s => {
                    const cleanService = { ...s };
                    if (s.categoryId && typeof s.categoryId === 'object') {
                        cleanService.categoryId = s.categoryId._id;
                    }
                    return cleanService;
                });
                await Service.insertMany(processedServices);
            }
        } else {
            console.warn('db_dump.json not found, skipping categories/services seed from dump.');
        }

        // 3. Seed Users (using logic from seed.js)
        console.log('Seeding users...');
        const salt = await bcrypt.genSalt(10);
        const users = [
            {
                name: 'Mallipudi Sai Krishna',
                email: 'saikrishna@atnis.in',
                phone: '9876543200',
                password: await bcrypt.hash('admin123', salt),
                role: 'Admin',
            },
            {
                name: 'Demo ServicePoint',
                email: 'demo@atnis.in',
                phone: '1234567890',
                password: await bcrypt.hash('servicepoint123', salt),
                role: 'ServicePoint',
            },
            {
                name: 'Main Customer Center',
                email: 'customer@atnis.in',
                phone: '9988776655',
                password: await bcrypt.hash('customer123', salt),
                role: 'Customer',
            },
            {
                name: 'Sai ServicePoint',
                email: 'sai01@gmail.com',
                phone: '9876543210',
                password: await bcrypt.hash('123456', 10),
                role: 'ServicePoint',
            },
        ];
        await User.insertMany(users);
        console.log('Users seeded.');

        // 4. Seed Technicians (re-using categories to map properly)
        console.log('Seeding technicians...');
        const categories = await Category.find({});
        const getCatId = (id) => categories.find(c => c.id === id)?._id;

        const techsData = [
            {
                name: 'Ravi Kumar Naidu',
                role: 'Networking/Hardware Expert',
                phone: '9876540001',
                location: 'Old Town',
                distanceKm: 1.2,
                rating: 4.9,
                status: 'available',
                categories: [getCatId('networking'), getCatId('hardware')].filter(Boolean),
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
                categories: [getCatId('networking'), getCatId('agriculture')].filter(Boolean),
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
                categories: [getCatId('electrical')].filter(Boolean),
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
                categories: [getCatId('electrical'), getCatId('mechanical')].filter(Boolean),
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
                categories: [getCatId('cctv'), getCatId('smart')].filter(Boolean),
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
                categories: [getCatId('ac')].filter(Boolean),
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
                categories: [getCatId('hardware')].filter(Boolean),
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
                categories: [getCatId('appliances')].filter(Boolean),
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
                categories: [getCatId('mechanical'), getCatId('electrical')].filter(Boolean),
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
                categories: [getCatId('smart'), getCatId('cctv')].filter(Boolean),
                experience: '4 Years',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
            }
        ];
        await Technician.insertMany(techsData);
        console.log('Technicians seeded.');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
};

migrateToAtlas();

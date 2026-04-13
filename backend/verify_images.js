const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('./models/Category');
const Service = require('./models/Service');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const cats = await Category.find({}, { name: 1, image: 1 });
    console.log('\n=== CATEGORIES ===');
    cats.forEach(c => console.log(`  ${c.name}: ${c.image.split('/').pop().split('?')[0]}`));

    const svcs = await Service.find({}, { name: 1, image: 1 });
    console.log('\n=== SERVICES ===');
    svcs.forEach(s => console.log(`  ${s.name}: ${s.image.split('/').pop().split('?')[0]}`));

    // Check for duplicates
    const allImgIds = svcs.map(s => s.image.split('/').pop().split('?')[0]);
    const seen = {};
    const dupes = [];
    allImgIds.forEach((id, i) => {
        if (seen[id]) dupes.push({ id, services: [seen[id], svcs[i].name] });
        else seen[id] = svcs[i].name;
    });
    console.log('\n=== DUPLICATE SERVICE IMAGES ===');
    if (dupes.length === 0) console.log('  None found! All service images are unique.');
    else dupes.forEach(d => console.log(`  DUPE: ${d.id} used by: ${d.services.join(', ')}`));

    mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });

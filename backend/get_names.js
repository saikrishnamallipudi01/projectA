const data = require('../db_dump.json');
const fs = require('fs');
const catNames = data.categories.map(c => c.name);
const srvNames = data.services.map(s => s.name);
fs.writeFileSync('../names.txt', 'Categories:\n' + catNames.join('\n') + '\n\nServices:\n' + srvNames.join('\n'));

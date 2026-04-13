const fs = require('fs');
const data = require('../db_dump.json');

let html = `<html><head><title>Image Test</title><style>
body { font-family: sans-serif; }
.grid { display: flex; flex-wrap: wrap; gap: 20px; }
.card { border: 1px solid #ccc; padding: 10px; width: 300px; }
.card img { max-width: 100%; height: auto; }
</style></head><body>
<h1>Categories</h1><div class="grid">
`;

data.categories.forEach(c => {
    html += `<div class="card">
        <h3>${c.name}</h3>
        <img src="${c.image}" alt="${c.name}" />
    </div>`;
});

html += `</div><h1>Services</h1><div class="grid">`;

data.services.forEach(s => {
    html += `<div class="card">
        <h3>${s.name} (Cat: ${s.categoryId.name})</h3>
        <img src="${s.image}" alt="${s.name}" />
    </div>`;
});

html += `</div></body></html>`;

fs.writeFileSync('test_images.html', html);
console.log('test_images.html generated.');

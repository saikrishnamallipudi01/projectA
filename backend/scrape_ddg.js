const https = require('https');

function search(query) {
    return new Promise((resolve, reject) => {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g);
                resolve(match ? [...new Set(match)] : []);
            });
        }).on('error', reject);
    });
}

search('site:unsplash.com "AC installation"').then(console.log);
search('site:unsplash.com "ceiling fan" room').then(console.log);

const fs = require('fs');
const path = require('path');

const seedFilePath = path.join(__dirname, 'seed.js');
let seedContent = fs.readFileSync(seedFilePath, 'utf8');

const imageUpdates = {
    'Camera Maintenance': 'https://loremflickr.com/800/600/camera,lens,cleaning/all',
    'Ceiling Fan Install': '/assets/images/ceiling_fan_install.png',
    'Exhaust Fan Fix': '/assets/images/exhaust_fan_fix.png',
    'Washing Machine Repair': '/assets/images/washing_machine_repair.png',
    'Door / Lock Repair': 'https://loremflickr.com/800/600/door,lock,hardware/all',
    'Smart Lighting Setup': 'https://loremflickr.com/800/600/smart,lighting,led/all',
    'Smart Lock Install': 'https://loremflickr.com/800/600/smart,lock,door/all',
    'Home Automation Hub': 'https://loremflickr.com/800/600/smart,home,hub,tablet/all',
    'Smart TV Setup': 'https://loremflickr.com/800/600/smart,tv,setup/all',
    'Network Troubleshoot': 'https://loremflickr.com/800/600/network,rack,technician/all',
    'Motor Pump Service': 'https://loremflickr.com/800/600/water,pump,motor/all',
    'False Ceiling Work': 'https://loremflickr.com/800/600/false,ceiling,gypsum/all',
    'Video Door Bell': 'https://loremflickr.com/800/600/smart,video,doorbell/all'
};

// Regex approach: find the block for the service name, then replace the image URL in it.
// Assuming structure like: name: 'Camera Maintenance', ... image: 'https://...'
let lines = seedContent.split('\n');
for (let i = 0; i < lines.length; i++) {
    for (const [svcName, newUrl] of Object.entries(imageUpdates)) {
        if (lines[i].includes(`name: '${svcName}'`) || lines[i].includes(`name: "${svcName}"`)) {
            // Found the service. Look ahead for the image field (within next 5 lines typically)
            for (let j = i; j < i + 6 && j < lines.length; j++) {
                if (lines[j].includes('image:')) {
                    lines[j] = lines[j].replace(/image:\s*['"][^'"]+['"]/, `image: '${newUrl}'`);
                    break;
                }
            }
        }
    }
}

fs.writeFileSync(seedFilePath, lines.join('\n'), 'utf8');
console.log('✅ Patched seed.js with fixed images.');

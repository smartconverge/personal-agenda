const dns = require('dns');

const hosts = [
    'db.pzvnwgpjszlufuoqlniv.supabase.co',
    'db.pzvnwgpjszlufuoqlniv.supabase.com',
    'pzvnwgpjszlufuoqlniv.supabase.co',
    'aws-0-sa-east-1.pooler.supabase.com'
];

async function checkHosts() {
    for (const host of hosts) {
        try {
            console.log(`🔍 Tentando resolver: ${host}`);
            const ip = await new Promise((resolve, reject) => {
                dns.lookup(host, (err, address) => {
                    if (err) reject(err);
                    else resolve(address);
                });
            });
            console.log(`✅ ${host} resolve para ${ip}`);
        } catch (err) {
            console.log(`❌ ${host} não resolveu.`);
        }
    }
}

checkHosts();

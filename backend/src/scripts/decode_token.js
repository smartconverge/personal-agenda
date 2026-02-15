const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = process.env.SUPABASE_ANON_KEY;

try {
    const decoded = jwt.decode(token);
    console.log('📦 Decoded Token:', JSON.stringify(decoded, null, 2));
} catch (err) {
    console.error('❌ Erro ao decodificar:', err.message);
}

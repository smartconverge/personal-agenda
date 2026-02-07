const { supabase } = require('../config/supabase');

/**
 * Middleware de autenticação
 * Valida JWT do Supabase e extrai professor_id
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação não fornecido'
            });
        }

        const token = authHeader.substring(7);

        // Validar token com Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }

        // Anexar professor_id ao request
        req.professorId = user.id;
        req.user = user;

        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao validar autenticação'
        });
    }
}

module.exports = { authenticate };

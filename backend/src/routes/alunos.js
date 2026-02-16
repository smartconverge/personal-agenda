const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const XLSX = require('xlsx');
const { authenticate } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const { supabaseAdmin } = require('../config/supabase');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.csv', '.xlsx', '.xls'];
        const ext = '.' + file.originalname.split('.').pop().toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Formato não suportado. Use CSV ou Excel (.xlsx)'));
        }
    }
});

/**
 * GET /alunos
 * Listar alunos do professor
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { nome, notificacoes_ativas } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('alunos')
            .select('*, contratos(id, status, servico:servicos(nome))', { count: 'exact' })
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .order('nome', { ascending: true })
            .range(from, to);

        if (nome) {
            query = query.ilike('nome', `%${nome}%`);
        }

        if (notificacoes_ativas !== undefined) {
            query = query.eq('notificacoes_ativas', notificacoes_ativas === 'true');
        }

        const { data, count, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data,
            meta: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar alunos'
        });
    }
});

/**
 * GET /alunos/:id
 * Obter detalhes de um aluno
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('alunos')
            .select('*')
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar aluno'
        });
    }
});

/**
 * POST /alunos
 * Criar novo aluno
 */
router.post('/', authenticate, planGuard('create_aluno'), async (req, res) => {
    try {
        let { nome, email, telefone_whatsapp, notificacoes_ativas, objetivo, plano } = req.body;

        if (!nome || !telefone_whatsapp) {
            return res.status(400).json({
                success: false,
                error: 'Nome e telefone são obrigatórios'
            });
        }

        // Normalização de telefone
        telefone_whatsapp = telefone_whatsapp.replace(/\D/g, '');

        const { data, error } = await supabaseAdmin
            .from('alunos')
            .insert({
                professor_id: req.professorId,
                nome: nome.trim(),
                email: email ? email.trim() : null,
                telefone_whatsapp: telefone_whatsapp.trim(),
                notificacoes_ativas: notificacoes_ativas || false,
                objetivo: objetivo ? objetivo.trim() : null,
                plano: plano || 'STARTER'
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    error: 'Aluno com este telefone já existe'
                });
            }
            console.error('Erro DB ao criar aluno:', error);
            return res.status(400).json({
                success: false,
                error: `Erro no banco: ${error.message}`
            });
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro interno ao criar aluno:', error);
        res.status(500).json({
            success: false,
            error: `Erro interno: ${error.message}`
        });
    }
});

/**
 * PUT /alunos/:id
 * Atualizar aluno
 */
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone_whatsapp, notificacoes_ativas, objetivo, plano } = req.body;

        const updateData = {};
        if (nome !== undefined) updateData.nome = nome.trim();
        if (email !== undefined) updateData.email = email ? email.trim() : null;
        if (telefone_whatsapp !== undefined) {
            updateData.telefone_whatsapp = telefone_whatsapp.replace(/\D/g, '');
        }
        if (notificacoes_ativas !== undefined) updateData.notificacoes_ativas = notificacoes_ativas;
        if (objetivo !== undefined) updateData.objetivo = objetivo ? objetivo.trim() : null;
        if (plano !== undefined) updateData.plano = plano;

        const { data, error } = await supabaseAdmin
            .from('alunos')
            .update(updateData)
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar aluno'
        });
    }
});

/**
 * DELETE /alunos/:id
 * Excluir aluno (soft delete)
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('alunos')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('professor_id', req.professorId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        res.json({
            success: true,
            data: { message: 'Aluno excluído com sucesso' }
        });
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir aluno'
        });
    }
});

/**
 * POST /alunos/importar-csv
 * Importar alunos via CSV ou Excel (.xlsx/.xls)
 */
router.post('/importar-csv', authenticate, planGuard('create_aluno'), upload.single('arquivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo enviado. Envie um CSV ou Excel.'
            });
        }

        const ext = req.file.originalname.split('.').pop().toLowerCase();
        let rows = [];

        if (ext === 'csv') {
            // Parse CSV - remove BOM e detecta delimitador automaticamente (; ou ,)
            let csvContent = req.file.buffer.toString('utf-8');
            // Remove BOM UTF-8 se presente (Excel adiciona ao salvar)
            if (csvContent.charCodeAt(0) === 0xFEFF) {
                csvContent = csvContent.substring(1);
            }
            const parsed = Papa.parse(csvContent, {
                header: true,
                skipEmptyLines: true,
                delimiter: '' // auto-detect: funciona com , e ;
            });

            if (parsed.errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Erro ao processar CSV',
                    details: parsed.errors
                });
            }
            rows = parsed.data;
        } else {
            // Parse Excel (.xlsx / .xls)
            try {
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            } catch (xlsErr) {
                return res.status(400).json({
                    success: false,
                    error: 'Erro ao ler o arquivo Excel. Verifique se o formato está correto.'
                });
            }
        }

        if (!rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Arquivo vazio ou sem dados válidos.'
            });
        }

        console.log(`📥 Importando ${rows.length} alunos (${ext.toUpperCase()}) para professor ${req.professorId}`);

        // Chamar função do banco
        const { data, error } = await supabaseAdmin
            .rpc('importar_alunos_csv', {
                p_professor_id: req.professorId,
                p_dados: rows
            });

        if (error) throw error;

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Erro ao importar:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao importar arquivo'
        });
    }
});

module.exports = router;

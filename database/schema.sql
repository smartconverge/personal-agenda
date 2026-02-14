-- ============================================
-- PERSONAL AGENDA - SCHEMA SUPABASE
-- ============================================
-- Timezone: America/Sao_Paulo
-- Multi-tenancy: professor_id em todas as tabelas
-- RLS: Habilitado em todas as tabelas

-- ============================================
-- EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: professores
-- ============================================
CREATE TABLE professores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    telefone_whatsapp TEXT NOT NULL,
    whatsapp_instance TEXT, -- Nome da instância na Evolution API
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para professores
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem ver apenas seus dados"
    ON professores
    FOR ALL
    USING (auth.uid() = id);

-- ============================================
-- TABELA: alunos
-- ============================================
CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone_whatsapp TEXT NOT NULL,
    notificacoes_ativas BOOLEAN DEFAULT FALSE,
    objetivo TEXT,
    plano TEXT DEFAULT 'Basic',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(professor_id, telefone_whatsapp)
);

-- Índices
CREATE INDEX idx_alunos_professor ON alunos(professor_id);
CREATE INDEX idx_alunos_telefone ON alunos(telefone_whatsapp);

-- RLS para alunos
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem gerenciar seus alunos"
    ON alunos
    FOR ALL
    USING (professor_id = auth.uid());

-- ============================================
-- TABELA: servicos
-- ============================================
CREATE TYPE tipo_servico AS ENUM ('presencial', 'online', 'ficha');

CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    tipo tipo_servico NOT NULL,
    nome TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_servicos_professor ON servicos(professor_id);
CREATE INDEX idx_servicos_tipo ON servicos(tipo);

-- RLS para servicos
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem gerenciar seus serviços"
    ON servicos
    FOR ALL
    USING (professor_id = auth.uid());

-- ============================================
-- TABELA: contratos
-- ============================================
CREATE TYPE status_contrato AS ENUM ('ativo', 'vencido', 'cancelado');

CREATE TABLE contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    data_inicio DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL CHECK (valor_mensal >= 0),
    status status_contrato DEFAULT 'ativo',
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contratos_professor ON contratos(professor_id);
CREATE INDEX idx_contratos_aluno ON contratos(aluno_id);
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_contratos_vencimento ON contratos(data_vencimento);

-- RLS para contratos
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem gerenciar seus contratos"
    ON contratos
    FOR ALL
    USING (professor_id = auth.uid());

-- ============================================
-- TABELA: sessoes
-- ============================================
CREATE TYPE tipo_recorrencia AS ENUM ('unica', 'semanal');
CREATE TYPE status_sessao AS ENUM ('agendada', 'cancelada', 'concluida', 'remarcada');

CREATE TABLE sessoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    data_hora_inicio TIMESTAMPTZ NOT NULL,
    data_hora_fim TIMESTAMPTZ NOT NULL,
    recorrencia tipo_recorrencia DEFAULT 'unica',
    status status_sessao DEFAULT 'agendada',
    sessao_original_id UUID REFERENCES sessoes(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (data_hora_fim > data_hora_inicio)
);

-- Índices
CREATE INDEX idx_sessoes_professor ON sessoes(professor_id);
CREATE INDEX idx_sessoes_aluno ON sessoes(aluno_id);
CREATE INDEX idx_sessoes_data_inicio ON sessoes(data_hora_inicio);
CREATE INDEX idx_sessoes_status ON sessoes(status);

-- RLS para sessoes
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem gerenciar suas sessões"
    ON sessoes
    FOR ALL
    USING (professor_id = auth.uid());

-- ============================================
-- TABELA: notification_log
-- ============================================
CREATE TYPE tipo_notificacao AS ENUM ('resumo_diario', 'lembrete_sessao', 'vencimento_contrato', 'comando_whatsapp', 'teste');
CREATE TYPE canal_notificacao AS ENUM ('whatsapp', 'email');
CREATE TYPE status_notificacao AS ENUM ('enviado', 'falha', 'pendente');

CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES professores(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES alunos(id) ON DELETE SET NULL,
    sessao_id UUID REFERENCES sessoes(id) ON DELETE SET NULL,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    tipo tipo_notificacao NOT NULL,
    canal canal_notificacao NOT NULL,
    mensagem TEXT NOT NULL,
    status status_notificacao DEFAULT 'pendente',
    enviado_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notification_professor ON notification_log(professor_id);
CREATE INDEX idx_notification_tipo ON notification_log(tipo);
CREATE INDEX idx_notification_status ON notification_log(status);
CREATE INDEX idx_notification_enviado ON notification_log(enviado_em);

-- RLS para notification_log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem ver seus logs de notificação"
    ON notification_log
    FOR SELECT
    USING (professor_id = auth.uid());

-- ============================================
-- TABELA: webhooks_processados
-- ============================================
CREATE TABLE webhooks_processados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_hash TEXT UNIQUE NOT NULL,
    processado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_hash ON webhooks_processados(webhook_hash);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON professores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessoes_updated_at BEFORE UPDATE ON sessoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Normalizar telefone para E.164
-- ============================================
CREATE OR REPLACE FUNCTION normalizar_telefone(telefone TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Remove todos os caracteres não numéricos
    telefone := regexp_replace(telefone, '[^0-9]', '', 'g');
    
    -- Se não começa com 55 (Brasil), adiciona
    IF NOT telefone ~ '^55' THEN
        telefone := '55' || telefone;
    END IF;
    
    RETURN telefone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNÇÃO: Importar alunos via CSV
-- ============================================
CREATE OR REPLACE FUNCTION importar_alunos_csv(
    p_professor_id UUID,
    p_dados JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_aluno JSONB;
    v_nome TEXT;
    v_telefone TEXT;
    v_notificacoes BOOLEAN;
    v_telefone_normalizado TEXT;
    v_importados INTEGER := 0;
    v_atualizados INTEGER := 0;
    v_erros JSONB := '[]'::JSONB;
    v_resultado JSONB;
BEGIN
    -- Iterar sobre cada linha do CSV
    FOR v_aluno IN SELECT * FROM jsonb_array_elements(p_dados)
    LOOP
        BEGIN
            v_nome := v_aluno->>'nome';
            v_telefone := v_aluno->>'telefone_whatsapp';
            v_notificacoes := COALESCE((v_aluno->>'notificacoes_ativas')::BOOLEAN, FALSE);
            
            -- Validações
            IF v_nome IS NULL OR trim(v_nome) = '' THEN
                v_erros := v_erros || jsonb_build_object(
                    'linha', v_aluno,
                    'erro', 'Nome é obrigatório'
                );
                CONTINUE;
            END IF;
            
            IF v_telefone IS NULL OR trim(v_telefone) = '' THEN
                v_erros := v_erros || jsonb_build_object(
                    'linha', v_aluno,
                    'erro', 'Telefone é obrigatório'
                );
                CONTINUE;
            END IF;
            
            -- Normalizar telefone
            v_telefone_normalizado := normalizar_telefone(v_telefone);
            
            -- Inserir ou atualizar aluno
            INSERT INTO alunos (professor_id, nome, telefone_whatsapp, notificacoes_ativas)
            VALUES (p_professor_id, trim(v_nome), v_telefone_normalizado, v_notificacoes)
            ON CONFLICT (professor_id, telefone_whatsapp)
            DO UPDATE SET
                nome = EXCLUDED.nome,
                notificacoes_ativas = EXCLUDED.notificacoes_ativas,
                updated_at = NOW();
            
            IF FOUND THEN
                v_atualizados := v_atualizados + 1;
            ELSE
                v_importados := v_importados + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            v_erros := v_erros || jsonb_build_object(
                'linha', v_aluno,
                'erro', SQLERRM
            );
        END;
    END LOOP;
    
    -- Retornar resultado
    v_resultado := jsonb_build_object(
        'importados', v_importados,
        'atualizados', v_atualizados,
        'erros', v_erros
    );
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Sessões com detalhes
CREATE OR REPLACE VIEW v_sessoes_detalhadas AS
SELECT 
    s.id,
    s.professor_id,
    s.data_hora_inicio,
    s.data_hora_fim,
    s.status,
    s.recorrencia,
    a.nome AS aluno_nome,
    a.telefone_whatsapp AS aluno_telefone,
    srv.nome AS servico_nome,
    srv.tipo AS servico_tipo
FROM sessoes s
JOIN alunos a ON s.aluno_id = a.id
JOIN servicos srv ON s.servico_id = srv.id
WHERE s.deleted_at IS NULL;

-- View: Contratos ativos com vencimento próximo
CREATE OR REPLACE VIEW v_contratos_vencendo AS
SELECT 
    c.id,
    c.professor_id,
    c.data_vencimento,
    c.valor_mensal,
    a.nome AS aluno_nome,
    a.telefone_whatsapp AS aluno_telefone,
    a.notificacoes_ativas,
    srv.nome AS servico_nome,
    (c.data_vencimento - CURRENT_DATE) AS dias_para_vencer
FROM contratos c
JOIN alunos a ON c.aluno_id = a.id
JOIN servicos srv ON c.servico_id = srv.id
WHERE c.status = 'ativo'
  AND c.deleted_at IS NULL
  AND c.data_vencimento >= CURRENT_DATE
  AND c.data_vencimento <= CURRENT_DATE + INTERVAL '7 days';

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================
-- Nenhum dado inicial necessário
-- Professores serão criados via Supabase Auth

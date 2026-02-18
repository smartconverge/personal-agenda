'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/Icons'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import WhatsAppConnect from '@/components/WhatsAppConnect'

export default function ConfiguracoesPage() {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [senhaData, setSenhaData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
    })

    const [preferencias, setPreferencias] = useState({
        tema: 'light',
        notificacoes_whatsapp: true,
        notificacoes_email: false,
        primeiro_dia_semana: 'domingo'
    })

    useEffect(() => {
        const savedTema = localStorage.getItem('theme') || 'light'
        setPreferencias(prev => ({ ...prev, tema: savedTema }))
    }, [])

    const handleSenhaChange = (e) => {
        const { name, value } = e.target
        setSenhaData(prev => ({ ...prev, [name]: value }))
    }

    const handleAlterarSenha = async (e) => {
        e.preventDefault()
        if (senhaData.novaSenha !== senhaData.confirmarSenha) {
            addToast('A nova senha e a confirmação não coincidem.', 'error')
            return
        }

        setLoading(true)
        try {
            const response = await api.put('/configuracoes/senha', {
                senhaAtual: senhaData.senhaAtual,
                novaSenha: senhaData.novaSenha
            })
            if (response.data.success) {
                addToast('Senha alterada com sucesso!', 'success')
                setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
            }
        } catch (error) {
            addToast(error.response?.data?.error || 'Erro ao alterar senha.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const toggleTema = () => {
        const novoTema = preferencias.tema === 'light' ? 'dark' : 'light'
        setPreferencias(prev => ({ ...prev, tema: novoTema }))
        localStorage.setItem('theme', novoTema)
        document.documentElement.setAttribute('data-theme', novoTema)
        addToast(`Modo ${novoTema === 'light' ? 'claro' : 'escuro'} ativado!`, 'info')
    }

    const handleExcluirConta = async () => {
        if (confirm('TEM CERTEZA? Essa ação é IRREVERSÍVEL e todos os seus dados serão apagados permanentemente.')) {
            const confirmacao = prompt('Para confirmar a exclusão, digite EXCLUIR:')
            if (confirmacao === 'EXCLUIR') {
                try {
                    const response = await api.delete('/configuracoes/excluir-conta')
                    if (response.data.success) {
                        localStorage.clear()
                        window.location.href = '/login'
                    }
                } catch (error) {
                    addToast('Erro ao excluir conta.', 'error')
                }
            }
        }
    }

    return (
        <div className="config-container">


            <div className="config-grid">
                {/* Segurança */}
                <div className="config-card card">
                    <h3 className="card-title">
                        <Icons.Dashboard size={18} /> Segurança
                    </h3>
                    <form onSubmit={handleAlterarSenha} className="config-form">
                        <div className="input-field">
                            <label>Senha Atual</label>
                            <input
                                type="password"
                                name="senhaAtual"
                                value={senhaData.senhaAtual}
                                onChange={handleSenhaChange}
                                placeholder="Senha atual"
                                required
                            />
                        </div>
                        <div className="input-field">
                            <label>Nova Senha</label>
                            <input
                                type="password"
                                name="novaSenha"
                                value={senhaData.novaSenha}
                                onChange={handleSenhaChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>
                        <div className="input-field">
                            <label>Confirmar Nova Senha</label>
                            <input
                                type="password"
                                name="confirmarSenha"
                                value={senhaData.confirmarSenha}
                                onChange={handleSenhaChange}
                                placeholder="Repita a nova senha"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processando...' : 'Atualizar Senha'}
                        </button>
                    </form>
                </div>

                {/* Preferências */}
                <div className="config-card card">
                    <h3 className="card-title">
                        <Icons.Dashboard size={18} /> Preferências do Sistema
                    </h3>
                    <div className="settings-list">
                        <div className="setting-item">
                            <div className="setting-info">
                                <strong>Tema do Sistema</strong>
                                <p>Alternar entre modo claro e escuro.</p>
                            </div>
                            <button onClick={toggleTema} className="btn btn-secondary">
                                {preferencias.tema === 'light' ? (
                                    <><Icons.Dashboard size={16} /> Modo Escuro</>
                                ) : (
                                    <><Icons.Dashboard size={16} /> Modo Claro</>
                                )}
                            </button>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <strong>Notificações WhatsApp</strong>
                                <p>Receber alertas de novos agendamentos.</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={preferencias.notificacoes_whatsapp}
                                    onChange={() => setPreferencias(p => ({ ...p, notificacoes_whatsapp: !p.notificacoes_whatsapp }))}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Zona de Perigo */}
                <div className="config-card card danger-zone">
                    <h3 className="card-title">Gestão de Dados</h3>
                    <p className="danger-text">Ao excluir sua conta, você perderá acesso a todos os seus alunos, contratos, serviços e histórico de agendamentos. Esta ação não pode ser desfeita.</p>
                    <button onClick={handleExcluirConta} className="btn btn-danger">
                        Excluir Minha Conta
                    </button>
                </div>
            </div>

            <style jsx>{`
                .config-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .header-config {
                    margin-bottom: 2rem;
                }

                .title-section {
                    font-size: 1.75rem;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }

                .subtitle-section {
                    color: var(--text-muted);
                    font-size: 0.9375rem;
                }

                .config-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }

                .config-card {
                    padding: 1.5rem;
                }

                .card-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    color: var(--text-primary);
                }

                .config-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    max-width: 400px;
                }

                .input-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-field label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .input-field input {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 0.625rem;
                    font-size: 0.875rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }

                .settings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .setting-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                }

                .setting-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .setting-info strong {
                    display: block;
                    font-size: 0.9375rem;
                    color: var(--text-primary);
                }

                .setting-info p {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .danger-zone {
                    border-color: rgba(239, 68, 68, 0.2);
                    background: rgba(239, 68, 68, 0.02);
                }

                .danger-text {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }

                /* Switch Styles */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--border);
                    transition: .4s;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                }

                input:checked + .slider {
                    background-color: var(--primary);
                }

                input:checked + .slider:before {
                    transform: translateX(20px);
                }

                .slider.round {
                    border-radius: 34px;
                }

                .slider.round:before {
                    border-radius: 50%;
                }
            `}</style>
        </div>
    )
}

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
        <div className="max-w-[1000px] mx-auto page-enter">
            <div className="flex flex-col">
                {/* Segurança */}
                <div className="elite-card">
                    <div className="elite-header">
                        <div className="elite-icon-box">
                            <Icons.Lock />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-primary m-0">Segurança da Conta</h3>
                            <p className="text-xs text-muted m-0">Gerencie sua senha e proteção de acesso</p>
                        </div>
                    </div>

                    <form onSubmit={handleAlterarSenha}>
                        <div className="elite-input-wrapper">
                            <label className="elite-label">Senha Atual</label>
                            <input
                                type="password"
                                name="senhaAtual"
                                className="input"
                                value={senhaData.senhaAtual}
                                onChange={handleSenhaChange}
                                placeholder="Sua senha atual"
                                required
                            />
                        </div>
                        <div className="elite-input-wrapper">
                            <label className="elite-label">Nova Senha</label>
                            <input
                                type="password"
                                name="novaSenha"
                                className="input"
                                value={senhaData.novaSenha}
                                onChange={handleSenhaChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>
                        <div className="elite-input-wrapper">
                            <label className="elite-label">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                name="confirmarSenha"
                                className="input"
                                value={senhaData.confirmarSenha}
                                onChange={handleSenhaChange}
                                placeholder="Repita a nova senha"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary !h-12 !px-10" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="spinner !w-4 !h-4 !border-white" />
                                    <span>Processando...</span>
                                </div>
                            ) : (
                                'Atualizar Minha Senha'
                            )}
                        </button>
                    </form>
                </div>

                {/* Preferências */}
                <div className="elite-card">
                    <div className="elite-header">
                        <div className="elite-icon-box">
                            <Icons.Settings />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-primary m-0">Preferências do Sistema</h3>
                            <p className="text-xs text-muted m-0">Personalize sua interface e notificações</p>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="elite-item-row flex-row-between">
                            <div>
                                <strong className="text-sm font-bold block mb-1">Tema Visual</strong>
                                <p className="text-xs text-muted m-0">Alterne entre o visual claro ou escuro do dashboard.</p>
                            </div>
                            <button onClick={toggleTema} className="btn btn-secondary !py-2.5 !px-6">
                                {preferencias.tema === 'light' ? (
                                    <><Icons.Moon size={16} /> Modo Escuro</>
                                ) : (
                                    <><Icons.Sun size={16} /> Modo Claro</>
                                )}
                            </button>
                        </div>

                        <div className="elite-item-row flex-row-between">
                            <div>
                                <strong className="text-sm font-bold block mb-1">Alertas via WhatsApp</strong>
                                <p className="text-xs text-muted m-0">Receba avisos automáticos de novos agendamentos.</p>
                            </div>
                            <label className="elite-switch">
                                <input
                                    type="checkbox"
                                    checked={preferencias.notificacoes_whatsapp}
                                    onChange={() => setPreferencias(p => ({ ...p, notificacoes_whatsapp: !p.notificacoes_whatsapp }))}
                                />
                                <span className="elite-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Zona de Perigo */}
                <div className="elite-card elite-card-danger">
                    <div className="elite-header">
                        <div className="elite-icon-box elite-icon-box-danger">
                            <Icons.Delete />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-red-500 m-0">Gestão de Dados Sensíveis</h3>
                            <p className="text-xs text-red-500 m-0 opacity-60">Ações críticas e irreversíveis</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted mb-8 leading-relaxed">
                        Ao excluir sua conta, todos os seus dados (alunos, contratos e histórico) serão
                        <strong> apagados permanentemente</strong>. Não há como desfazer esta ação após a confirmação.
                    </p>

                    <button onClick={handleExcluirConta} className="btn btn-danger !btn-sm !px-10">
                        Desativar Minha Conta permanentemente
                    </button>
                </div>
            </div>
        </div>
    )
}

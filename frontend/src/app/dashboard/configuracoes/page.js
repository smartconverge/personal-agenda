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
        <div className="max-w-[800px] mx-auto page-enter">
            <div className="grid grid-cols-1 gap-6">
                {/* Segurança */}
                <div className="card-premium p-7 !bg-secondary">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex-center text-primary">
                            <Icons.Lock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-primary m-0">Segurança</h3>
                            <p className="text-xs text-muted m-0">Gerencie sua senha e proteção de conta</p>
                        </div>
                    </div>

                    <form onSubmit={handleAlterarSenha} className="max-w-[450px]">
                        <div className="mb-5">
                            <label className="label">Senha Atual</label>
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
                        <div className="mb-5">
                            <label className="label">Nova Senha</label>
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
                        <div className="mb-8">
                            <label className="label">Confirmar Nova Senha</label>
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
                        <button type="submit" className="btn btn-primary !h-12 !px-8" disabled={loading}>
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
                <div className="card-premium p-7 !bg-secondary">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex-center text-primary">
                            <Icons.Settings size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-primary m-0">Preferências do Sistema</h3>
                            <p className="text-xs text-muted m-0">Personalize sua experiência de uso</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex-between p-4 card-flat">
                            <div>
                                <strong className="text-sm font-bold block mb-1">Tema Visual</strong>
                                <p className="text-xs text-muted m-0">Alterne entre o visual claro ou escuro.</p>
                            </div>
                            <button onClick={toggleTema} className="btn btn-secondary !py-2 !px-4">
                                {preferencias.tema === 'light' ? (
                                    <><Icons.Moon size={16} /> Modo Escuro</>
                                ) : (
                                    <><Icons.Sun size={16} /> Modo Claro</>
                                )}
                            </button>
                        </div>

                        <div className="flex-between p-4 card-flat">
                            <div>
                                <strong className="text-sm font-bold block mb-1">Alertas via WhatsApp</strong>
                                <p className="text-xs text-muted m-0">Receba avisos de novos agendamentos vinculados.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={preferencias.notificacoes_whatsapp}
                                    onChange={() => setPreferencias(p => ({ ...p, notificacoes_whatsapp: !p.notificacoes_whatsapp }))}
                                />
                                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Zona de Perigo */}
                <div className="card-premium p-7 !bg-red-500/5 border-red-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex-center text-red-500">
                            <Icons.Delete size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-red-500 m-0">Gestão de Dados Sensíveis</h3>
                            <p className="text-xs text-red-500/60 m-0">Ações críticas e irreversíveis</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted mb-6">
                        Ao excluir sua conta, todos os seus dados (alunos, contratos e histórico) serão
                        <strong> apagados permanentemente</strong>. Não há como desfazer esta ação.
                    </p>

                    <button onClick={handleExcluirConta} className="btn btn-danger !btn-sm !px-6">
                        Desativar Minha Conta
                    </button>
                </div>
            </div>
        </div>
    )
}

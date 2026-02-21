'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/Icons'
import api from '@/lib/api'
import { useToast } from '@/components/Toast'
import WhatsAppConnect from '@/components/WhatsAppConnect'
import styles from './Settings.module.css'

export default function ConfiguracoesPage() {
    const { showToast } = useToast()
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
        showToast('A nova senha e a confirmação não coincidem.', 'error')

        setLoading(true)
        try {
            const response = await api.put('/configuracoes/senha', {
                senhaAtual: senhaData.senhaAtual,
                novaSenha: senhaData.novaSenha
            })
            if (response.data.success) {
                showToast('Senha atualizada com sucesso!', 'success')
                setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Erro ao alterar senha.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const toggleTema = () => {
        const novoTema = preferencias.tema === 'light' ? 'dark' : 'light'
        setPreferencias(prev => ({ ...prev, tema: novoTema }))
        localStorage.setItem('theme', novoTema)
        document.documentElement.setAttribute('data-theme', novoTema)
        showToast(`Modo ${novoTema === 'light' ? 'claro' : 'escuro'} ativado!`, 'info')
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
                    showToast('Erro ao sair da conta.', 'error')
                }
            }
        }
    }

    return (
        <div className={styles.container}>
            {/* Segurança */}
            <div className={styles.section}>
                <div className={styles.header}>
                    <div className={styles.iconBox}>
                        <Icons.Lock size={20} />
                    </div>
                    <div>
                        <h3 className={styles.sectionTitle}>Segurança da Conta</h3>
                        <p className={styles.sectionSubtitle}>Gerencie sua senha e proteção de acesso</p>
                    </div>
                </div>

                <form onSubmit={handleAlterarSenha}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Senha Atual</label>
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
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nova Senha</label>
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
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Confirmar Nova Senha</label>
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
            <div className={styles.section}>
                <div className={styles.header}>
                    <div className={styles.iconBox}>
                        <Icons.Settings size={20} />
                    </div>
                    <div>
                        <h3 className={styles.sectionTitle}>Preferências do Sistema</h3>
                        <p className={styles.sectionSubtitle}>Personalize sua interface e notificações</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className={styles.row}>
                        <div className={styles.toggleInfo}>
                            <strong className={styles.toggleLabel}>Tema Visual</strong>
                            <p className={styles.toggleDesc}>Alterne entre o visual claro ou escuro do dashboard.</p>
                        </div>
                        <button onClick={toggleTema} className="btn btn-secondary !py-2.5 !px-6">
                            {preferencias.tema === 'light' ? (
                                <span className="flex items-center gap-2"><Icons.Moon size={16} /> Modo Escuro</span>
                            ) : (
                                <span className="flex items-center gap-2"><Icons.Sun size={16} /> Modo Claro</span>
                            )}
                        </button>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.toggleInfo}>
                            <strong className={styles.toggleLabel}>Alertas via WhatsApp</strong>
                            <p className={styles.toggleDesc}>Receba avisos automáticos de novos agendamentos.</p>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={preferencias.notificacoes_whatsapp}
                                onChange={() => setPreferencias(p => ({ ...p, notificacoes_whatsapp: !p.notificacoes_whatsapp }))}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Zona de Perigo */}
            <div className={`${styles.section} ${styles['section--danger']}`}>
                <div className={styles.header}>
                    <div className={`${styles.iconBox} ${styles['iconBox--danger']}`}>
                        <Icons.Delete size={20} />
                    </div>
                    <div>
                        <h3 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Gestão de Dados Sensíveis</h3>
                        <p className={styles.sectionSubtitle}>Ações críticas e irreversíveis</p>
                    </div>
                </div>

                <p className={styles.dangerDesc}>
                    Ao excluir sua conta, todos os seus dados (alunos, contratos e histórico) serão
                    <strong> apagados permanentemente</strong>. Não há como desfazer esta ação após a confirmação.
                </p>

                <button onClick={handleExcluirConta} className="btn btn-danger !btn-sm !px-10">
                    Desativar Minha Conta permanentemente
                </button>
            </div>
        </div>
    )
}

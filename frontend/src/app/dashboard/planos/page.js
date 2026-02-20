'use client'

import { Icons } from '@/components/Icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function PlanosPage() {
    const [professor, setProfessor] = useState(null)

    useEffect(() => {
        const professorData = localStorage.getItem('professor')
        if (professorData) {
            setProfessor(JSON.parse(professorData))
        }
    }, [])

    const isCurrentPlan = (nomePlano) => {
        if (!professor) return nomePlano === 'STARTER' // Fallback
        return professor.plano?.toUpperCase() === nomePlano.toUpperCase()
    }

    const planos = [
        {
            nome: 'STARTER',
            preco: 'R$ 29,90',
            period: '/mês',
            descricao: 'O Essencial para Organizar sua Agenda e focar no atendimento.',
            features: [
                'Agenda completa (bloqueio de conflitos)',
                'Cadastro ilimitado de alunos',
                'Cadastro de serviços (presencial/online)',
                'Dashboard básico de visão geral',
                'Importação de planilhas',
                'Gestão de contratos simples',
                'Notificações para o PROFESSOR (WhatsApp)'
            ],
            limit: 'Ilimitado',
            button: 'Assinar Agora',
            current: isCurrentPlan('STARTER'),
            popular: true
        },
        {
            nome: 'PRO',
            preco: 'R$ 59,90',
            period: '/mês',
            descricao: 'Automação Completa + Gestão Financeira (Em Breve).',
            features: [
                'Tudo do STARTER',
                'Lembretes automáticos para ALUNOS',
                'Controle de mensalidades/pagamentos',
                'Dashboard financeiro e inadimplência',
                'Envio de links de pagamento (Pix/PicPay)',
                'Relatórios mensais em PDF'
            ],
            limit: 'Em Breve',
            button: 'Em Breve',
            current: false,
            popular: false,
            disabled: true
        },
        {
            nome: 'PREMIUM',
            preco: 'R$ 99,90',
            period: '/mês',
            descricao: 'Inteligência Artificial + Recursos Avançados (Em Breve).',
            features: [
                'Tudo do PRO',
                'IA para agendamento via WhatsApp',
                'Sistema de Fichas de Treino nativo',
                'Avaliação física e fotos de progresso',
                'App mobile nativo (iOS/Android)',
                'Whitelabel (sua marca)'
            ],
            limit: 'Em Breve',
            button: 'Em Breve',
            current: false,
            popular: false,
            disabled: true
        }
    ]

    return (
        <div className="planos-container">


            <div className="planos-grid">
                {planos.map((plano) => (
                    <div key={plano.nome} className={`plano-card card ${plano.popular ? 'popular' : ''} ${plano.current ? 'current-plan-card' : ''}`}>
                        {plano.popular && <span className="badge-popular">MAIS ESCOLHIDO</span>}
                        {plano.current && <span className="badge-current">SEU PLANO ATUAL</span>}

                        <div className="plano-header">
                            <span className="plano-nome">{plano.nome}</span>
                            <div className="plano-preco">
                                <span className="moeda">{plano.preco === 'Grátis' ? '' : 'R$'}</span>
                                <span className="valor">{plano.preco.replace('R$', '').trim()}</span>
                                <span className="periodo">{plano.period}</span>
                            </div>
                            <p className="plano-desc">{plano.descricao}</p>
                        </div>

                        <div className="plano-features">
                            <ul className="feature-list">
                                {plano.features.map((feature, idx) => (
                                    <li key={idx} className="feature-item">
                                        <Icons.CheckCircle size={16} className="feature-icon" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="plano-footer">
                            <button className={`btn ${plano.current ? 'btn-current-active' : (plano.popular ? 'btn-primary' : 'btn-secondary')} ${plano.current ? 'disabled' : ''} !w-full !h-14 !text-base !rounded-xl`}>
                                {plano.current ? 'Plano Ativo' : 'Assinar Agora'}
                            </button>
                            <span className="plano-limit-info">{plano.limit}</span>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .current-plan-card {
                    border: 2px solid var(--primary) !important;
                    position: relative;
                }
                .badge-current {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--primary);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 2rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .btn-current-active {
                    background: var(--bg-tertiary);
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    cursor: default;
                }
            `}</style>
        </div>
    )
}

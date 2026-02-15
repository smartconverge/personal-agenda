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
            preco: 'Grátis',
            descricao: 'Ideal para quem está iniciando sua jornada como Personal Trainer.',
            features: [
                'Até 5 alunos ativos',
                'Agenda básica',
                'Gestão de serviços',
                'Notificações WhatsApp (Limitadas)',
                'Suporte via e-mail'
            ],
            limit: 'Limite de 5 alunos',
            button: 'Começar Agora',
            current: isCurrentPlan('STARTER'),
            popular: false
        },
        {
            nome: 'PRO',
            preco: 'R$ 49,90',
            period: '/mês',
            descricao: 'A escolha ideal para quem quer escalar seus atendimentos.',
            features: [
                'Até 20 alunos ativos',
                'Agenda avançada (Recorrência)',
                'Fichas de treino ilimitadas',
                'Notificações automáticas ilimitadas',
                'Relatórios de faturamento',
                'Suporte prioritário'
            ],
            limit: 'Limite de 20 alunos',
            button: 'Mudar para Pro',
            current: isCurrentPlan('PRO'),
            popular: true
        },
        {
            nome: 'PREMIUM',
            preco: 'R$ 89,90',
            period: '/mês',
            descricao: 'Gestão profissional completa para alta performance.',
            features: [
                'Alunos ilimitados',
                'Consultoria via Chat IA (Beta)',
                'Gestão Multi-unidade',
                'Análise de performance com IA',
                'Personalização completa de marca',
                'Acesso antecipado a novas features'
            ],
            limit: 'Sem limites',
            button: 'Seja Premium',
            current: isCurrentPlan('PREMIUM'),
            popular: false
        }
    ]

    return (
        <div className="planos-container">
            <div className="header-planos">
                <h2 className="title-section">Escolha seu Plano</h2>
                <p className="subtitle-section">Evolua sua gestão com recursos desenvolvidos especialmente para Personal Trainers.</p>
            </div>

            <div className="planos-grid">
                {planos.map((plano) => (
                    <div key={plano.nome} className={`plano-card card ${plano.popular ? 'popular' : ''}`}>
                        {plano.popular && <span className="badge-popular">MAIS ESCOLHIDO</span>}

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
                                        <Icons.Dashboard size={16} className="feature-icon" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="plano-footer">
                            <button className={`btn-plano ${plano.current ? 'current' : ''} ${plano.popular ? 'btn-popular' : ''}`}>
                                {plano.current ? 'Seu Plano Atual' : 'Assinar Agora'}
                            </button>
                            <span className="plano-limit-info">{plano.limit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .planos-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding-bottom: 3rem;
                }

                .header-planos {
                    text-align: center;
                    margin-bottom: 3.5rem;
                }

                .title-section {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 0.75rem;
                    letter-spacing: -0.02em;
                }

                .subtitle-section {
                    color: var(--text-muted);
                    font-size: 1.125rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .planos-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .plano-card {
                    display: flex;
                    flex-direction: column;
                    padding: 2.5rem;
                    position: relative;
                    transition: all 0.3s ease;
                    border: 1px solid var(--border);
                    background: var(--bg-secondary);
                }

                .plano-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
                    border-color: var(--primary-light);
                }

                .plano-card.popular {
                    border: 2px solid var(--primary);
                    background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-tertiary));
                    transform: scale(1.05);
                }

                .plano-card.popular:hover {
                    transform: scale(1.05) translateY(-8px);
                }

                .badge-popular {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--primary);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 0.375rem 1rem;
                    border-radius: 2rem;
                    letter-spacing: 0.05em;
                }

                .plano-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .plano-nome {
                    font-size: 0.875rem;
                    font-weight: 800;
                    color: var(--primary);
                    letter-spacing: 0.1em;
                    margin-bottom: 1rem;
                    display: block;
                }

                .plano-preco {
                    margin-bottom: 1rem;
                }

                .moeda {
                    font-size: 1.5rem;
                    font-weight: 700;
                    vertical-align: top;
                    margin-right: 0.25rem;
                }

                .valor {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }

                .periodo {
                    font-size: 1rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .plano-desc {
                    font-size: 0.9375rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                .plano-features {
                    flex: 1;
                    margin-bottom: 2.5rem;
                }

                .feature-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    font-size: 0.9375rem;
                    color: var(--text-secondary);
                }

                .feature-icon {
                    color: var(--primary);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .plano-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                .btn-plano {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid var(--primary);
                    background: transparent;
                    color: var(--primary);
                }

                .btn-plano:hover:not(.current) {
                    background: var(--primary);
                    color: white;
                }

                .btn-popular {
                    background: var(--primary);
                    color: white;
                }

                .btn-popular:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                }

                .btn-plano.current {
                    background: var(--bg-tertiary);
                    border-color: var(--border);
                    color: var(--text-muted);
                    cursor: default;
                }

                .plano-limit-info {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                @media (max-width: 992px) {
                    .planos-grid {
                        grid-template-columns: 1fr;
                        max-width: 450px;
                        margin: 0 auto;
                        gap: 3rem;
                    }
                    .plano-card.popular {
                        transform: scale(1);
                    }
                    .plano-card.popular:hover {
                        transform: translateY(-8px);
                    }
                }
            `}</style>
        </div>
    )
}

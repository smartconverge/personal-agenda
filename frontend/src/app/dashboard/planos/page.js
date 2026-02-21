'use client'

import { Icons } from '@/components/Icons'
import { useEffect, useState } from 'react'
import styles from './Plans.module.css'

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
        <div className={styles.container}>
            <div className={styles.grid}>
                {planos.map((plano) => (
                    <div
                        key={plano.nome}
                        className={`
                            ${styles.card} 
                            ${plano.popular ? styles['card--popular'] : ''} 
                            ${plano.current ? styles['card--current'] : ''}
                        `}
                    >
                        {plano.popular && <span className={`${styles.badge} ${styles['badge--popular']}`}>MAIS ESCOLHIDO</span>}
                        {plano.current && <span className={`${styles.badge} ${styles['badge--current']}`}>SEU PLANO ATUAL</span>}

                        <div className={styles.header}>
                            <span className={styles.name}>{plano.nome}</span>
                            <div className={styles.price}>
                                <span className={styles.currency}>{plano.preco === 'Grátis' ? '' : 'R$'}</span>
                                <span className={styles.value}>{plano.preco.replace('R$', '').trim()}</span>
                                <span className={styles.period}>{plano.period}</span>
                            </div>
                            <p className={styles.desc}>{plano.descricao}</p>
                        </div>

                        <div className={styles.features}>
                            <ul className={styles.featureList}>
                                {plano.features.map((feature, idx) => (
                                    <li key={idx} className={styles.featureItem}>
                                        <Icons.CheckCircle size={16} className={styles.featureIcon} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.footer}>
                            <button
                                className={`
                                    btn 
                                    ${plano.current ? styles.btnCurrent : (plano.popular ? 'btn-primary' : 'btn-secondary')} 
                                    ${plano.current || plano.disabled ? 'disabled' : ''} 
                                    !w-full !h-14 !text-base !rounded-xl
                                `}
                                disabled={plano.current || plano.disabled}
                            >
                                {plano.current ? 'Plano Ativo' : plano.disabled ? 'Em Breve' : 'Assinar Agora'}
                            </button>
                            <span className={styles.limitInfo}>{plano.limit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

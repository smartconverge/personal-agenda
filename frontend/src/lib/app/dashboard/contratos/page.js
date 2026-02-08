'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function ContratosPage() {
    const [contratos, setContratos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadContratos()
    }, [])

    const loadContratos = async () => {
        try {
            const response = await api.get('/api/contratos')
            setContratos(response.data)
        } catch (error) {
            alert('Erro ao carregar contratos')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            ativo: { class: 'badge-success', label: 'Ativo' },
            cancelado: { class: 'badge-danger', label: 'Cancelado' },
            vencido: { class: 'badge-warning', label: 'Vencido' }
        }
        return badges[status] || badges.ativo
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>
                    Contratos
                </h1>
            </div>

            <div className="card">
                {contratos.length === 0 ? (
                    <p className="text-muted">Nenhum contrato cadastrado</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Serviço</th>
                                    <th>Valor Mensal</th>
                                    <th>Dia Vencimento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contratos.map((contrato) => {
                                    const badge = getStatusBadge(contrato.status)
                                    return (
                                        <tr key={contrato.id}>
                                            <td style={{ fontWeight: '500' }}>{contrato.aluno?.nome || 'N/A'}</td>
                                            <td>{contrato.servico?.nome || 'N/A'}</td>
                                            <td>R$ {parseFloat(contrato.valor_mensal).toFixed(2)}</td>
                                            <td>Dia {contrato.dia_vencimento}</td>
                                            <td>
                                                <span className={`badge ${badge.class}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

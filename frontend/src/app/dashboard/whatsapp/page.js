'use client'

import { useState, useEffect } from 'react'
import { Icons } from '@/components/Icons'
import WhatsAppConnect from '@/components/WhatsAppConnect'

export default function WhatsAppPage() {
    return (
        <div className="whatsapp-page-container">
            <div className="whatsapp-grid">
                {/* Lado Esquerdo: Conexão */}
                <div className="connection-section">
                    <WhatsAppConnect />
                </div>

                {/* Lado Direito: Informativo e Comparativo */}
                <div className="info-section">
                    <div className="card info-card">
                        <div className="card-header-premium">
                            <Icons.Dashboard size={24} className="icon-gold" />
                            <h3>Tecnologia SmartConverge</h3>
                        </div>
                        <p className="card-description">
                            Utilizamos a <strong>Evolution API</strong>, uma infraestrutura de ponta que permite conectar seu próprio número sem taxas por mensagem.
                        </p>

                        <div className="comparison-table">
                            <div className="table-header">
                                <span>Recurso</span>
                                <span>Evolution (Atual)</span>
                                <span>API Oficial</span>
                            </div>
                            <div className="table-row">
                                <span>Custo por Mensagem</span>
                                <span className="text-green">Grátis</span>
                                <span className="text-red">Pago ($)</span>
                            </div>
                            <div className="table-row">
                                <span>Usa seu Número/Chip</span>
                                <span className="text-green">Sim</span>
                                <span className="text-red">Não (Virtual)</span>
                            </div>
                            <div className="table-row">
                                <span>Selo de Verificado</span>
                                <span className="text-red">Não</span>
                                <span className="text-green">Sim</span>
                            </div>
                            <div className="table-row">
                                <span>Risco de Banimento</span>
                                <span className="text-orange">Baixo (via API)</span>
                                <span className="text-green">Zero</span>
                            </div>
                        </div>

                        <div className="cta-section">
                            <h4>Deseja a API Oficial?</h4>
                            <p>Para grandes escalas ou empresas que exigem o selo verde de verificado.</p>
                            <a href="mailto:contato@smartconverge.com.br" className="btn btn-outline-primary">
                                <Icons.Dashboard size={16} /> Falar com Especialista
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .whatsapp-page-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .whatsapp-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 1.5rem;
                    align-items: start;
                }
                @media (max-width: 1024px) {
                    .whatsapp-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .card-header-premium {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .card-header-premium h3 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text-primary);
                }
                .icon-gold {
                    color: #f59e0b;
                }
                .card-description {
                    font-size: 0.9375rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .comparison-table {
                    background: var(--bg-tertiary);
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    margin-bottom: 2rem;
                }
                .table-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding: 0.75rem 1rem;
                    background: rgba(var(--primary-rgb), 0.05);
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: var(--primary);
                    border-bottom: 1px solid var(--border);
                }
                .table-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding: 0.75rem 1rem;
                    font-size: 0.8125rem;
                    border-bottom: 1px solid var(--border);
                    color: var(--text-secondary);
                }
                .table-row:last-child {
                    border-bottom: none;
                }
                .text-green { color: #10b981; font-weight: 700; }
                .text-red { color: #ef4444; font-weight: 700; }
                .text-orange { color: #f59e0b; font-weight: 700; }

                .cta-section {
                    padding: 1.5rem;
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent);
                    border-radius: 0.75rem;
                    border: 1px dashed var(--primary);
                    text-align: center;
                }
                .cta-section h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }
                .cta-section p {
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    margin-bottom: 1.25rem;
                }
            `}</style>
        </div>
    )
}

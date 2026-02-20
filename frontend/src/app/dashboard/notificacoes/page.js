'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Icons } from '@/components/Icons'
import {
    getStatusBadge,
    getStatusText,
    formatDate,
    formatTime,
    getNotificationIcon,
    getNotificationColor,
    getNotificationBg
} from '@/utils/formatters'
import Pagination from '@/components/Pagination'

export default function NotificacoesPage() {
    const [notificacoes, setNotificacoes] = useState([])
    const [loading, setLoading] = useState(true)

    // Pagination Params
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const itemsPerPage = 20

    useEffect(() => {
        loadNotificacoes()
    }, [page])

    const loadNotificacoes = async () => {
        setLoading(true)
        try {
            const response = await api.get('/notificacoes', {
                params: {
                    page,
                    limit: itemsPerPage
                }
            })
            if (response.data.success) {
                setNotificacoes(response.data.data || [])
                setTotalPages(response.data.meta?.totalPages || 1)
                setTotalItems(response.data.meta?.total || 0)
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading && notificacoes.length === 0) {
        return (
            <div className="flex-center p-12">
                <div className="spinner !w-12 !h-12" />
            </div>
        )
    }

    return (
        <div className="max-w-[1000px] mx-auto">
            <div className="card-premium p-0 overflow-hidden !bg-secondary">
                <div className="p-6 border-b border-border flex justify-end">
                    <span className="badge badge-secondary">
                        {totalItems} total
                    </span>
                </div>

                {notificacoes.length === 0 ? (
                    <div className="text-center py-16 px-8">
                        <Icons.Notifications size={48} className="text-muted opacity-30 mb-4 mx-auto" />
                        <p className="text-muted font-medium">Nenhuma notificação registrada</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notificacoes.map((notif, index) => {
                            const IconComponent = getNotificationIcon(notif.status, Icons)
                            const iconColor = getNotificationColor(notif.status)
                            const iconBg = getNotificationBg(notif.status)

                            return (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-5 px-6 py-5 border-b transition-colors duration-200 cursor-default hover:bg-primary-light ${index === notificacoes.length - 1 ? '!border-none' : 'border-border'
                                        }`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex-center flex-shrink-0"
                                        style={{ backgroundColor: iconBg }}
                                    >
                                        <IconComponent size={20} color={iconColor} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex-between mb-1 gap-4">
                                            <h3 className="text-base font-bold text-primary truncate m-0">
                                                {notif.tipo.charAt(0).toUpperCase() + notif.tipo.slice(1)}
                                            </h3>
                                            <span className="text-xs text-muted whitespace-nowrap">
                                                {formatDate(notif.created_at)} {formatTime(notif.created_at)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-secondary mb-3 leading-relaxed">
                                            {notif.mensagem}
                                        </p>

                                        <div className="flex-between">
                                            <div className="flex items-center gap-2">
                                                <Icons.Students size={14} className="text-muted" />
                                                <span className="text-[0.8rem] text-muted font-medium">
                                                    {notif.telefone_destino}
                                                </span>
                                            </div>
                                            <span className={`badge ${getStatusBadge(notif.status)} text-[0.625rem]`}>
                                                {getStatusText(notif.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />
        </div>
    )
}

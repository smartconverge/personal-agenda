/**
 * Utilitários de Formatação e Interface
 */

export const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
}

export const getAvatarColor = (index) => {
    const colors = [
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #ef4444, #dc2626)',
    ]
    return colors[index % colors.length]
}

export const getStatusBadge = (status) => {
    const badges = {
        'agendada': 'badge-info',
        'confirmada': 'badge-success',
        'concluida': 'badge-success',
        'cancelada': 'badge-danger',
        'pendente': 'badge-warning',
        'read': 'badge-secondary',
        'unread': 'badge-primary'
    }
    return badges[status] || 'badge-secondary'
}

export const getStatusText = (status) => {
    const texts = {
        'agendada': 'AGENDADA',
        'confirmada': 'CONFIRMADA',
        'concluida': 'CONCLUÍDA',
        'cancelada': 'CANCELADA',
        'pendente': 'PENDENTE',
        'read': 'LIDA',
        'unread': 'NOVA'
    }
    return texts[status] || (status ? status.toUpperCase() : '')
}

export const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('pt-BR')
}

export const formatTime = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export const getNotificationIcon = (status, Icons) => {
    switch (status) {
        case 'enviado': return Icons.CheckCircle
        case 'erro': return Icons.Error
        case 'pendente': return Icons.Alert
        default: return Icons.Info
    }
}

export const getNotificationColor = (status) => {
    switch (status) {
        case 'enviado': return 'var(--success)'
        case 'erro': return 'var(--danger)'
        case 'pendente': return 'var(--warning)'
        default: return 'var(--info)'
    }
}

export const getNotificationBg = (status) => {
    switch (status) {
        case 'enviado': return 'hsl(155, 72%, 32%, 0.1)'
        case 'erro': return 'hsl(0, 72%, 55%, 0.1)'
        case 'pendente': return 'hsl(40, 96%, 50%, 0.1)'
        default: return 'hsl(215, 85%, 55%, 0.1)'
    }
}


import { Icons } from './Icons'

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)'
        }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de <strong>{totalItems}</strong> resultados
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', height: '2rem', width: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Icons.ChevronLeft size={16} />
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '2rem',
                    height: '2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                }}>
                    {currentPage}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', height: '2rem', width: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Icons.ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

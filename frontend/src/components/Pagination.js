import { Icons } from './Icons'
import styles from './Pagination.module.css'

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) {
    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className={styles.root}>
            <p className={styles.info}>
                Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{' '}
                <strong>{totalItems}</strong> resultados
            </p>

            <div className={styles.controls}>
                <button
                    className={styles.btn}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    <Icons.ChevronLeft size={16} />
                </button>

                <span className={styles.current} aria-current="page">
                    {currentPage}
                </span>

                <button
                    className={styles.btn}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                >
                    <Icons.ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

import { useTranslation } from 'react-i18next';
import './Pagination.css';

export default function Pagination({ total, limit, offset, onChange }) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  const goTo = (page) => onChange((page - 1) * limit);

  return (
    <div className="pagination">
      <button type="button" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>
        {t('common.previous')}
      </button>
      <span className="pagination-status">
        {t('common.page')} {currentPage} {t('common.of')} {totalPages} &middot; {total} {t('common.total')}
      </span>
      <button type="button" disabled={currentPage === totalPages} onClick={() => goTo(currentPage + 1)}>
        {t('common.next')}
      </button>
    </div>
  );
}

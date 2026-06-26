import './Pagination.css';

export default function Pagination({ total, limit, offset, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  const goTo = (page) => onChange((page - 1) * limit);

  return (
    <div className="pagination">
      <button type="button" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)}>
        Previous
      </button>
      <span className="pagination-status">
        Page {currentPage} of {totalPages} &middot; {total} total
      </span>
      <button type="button" disabled={currentPage === totalPages} onClick={() => goTo(currentPage + 1)}>
        Next
      </button>
    </div>
  );
}

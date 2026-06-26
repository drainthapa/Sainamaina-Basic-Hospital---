import { Search, Plus } from 'lucide-react';
import './Toolbar.css';

export default function Toolbar({
  searchValue, onSearchChange, searchPlaceholder = 'Search…', filters, onCreate, createLabel = 'New',
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {onSearchChange && (
          <div className="toolbar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {filters}
      </div>
      {onCreate && (
        <button type="button" className="btn btn-primary btn-md" onClick={onCreate}>
          <Plus size={16} /> {createLabel}
        </button>
      )}
    </div>
  );
}

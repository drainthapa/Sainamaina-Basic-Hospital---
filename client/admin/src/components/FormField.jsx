import './FormField.css';

export function Field({ label, error, required, hint, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export function TextInput({ error, ...rest }) {
  return <input className={`field-input ${error ? 'field-input-error' : ''}`} {...rest} />;
}

export function TextArea({ error, rows = 4, ...rest }) {
  return <textarea className={`field-input ${error ? 'field-input-error' : ''}`} rows={rows} {...rest} />;
}

export function Select({ error, children, ...rest }) {
  return (
    <select className={`field-input ${error ? 'field-input-error' : ''}`} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({ label, ...rest }) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}

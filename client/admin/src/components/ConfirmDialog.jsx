import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import './ConfirmDialog.css';

export function useConfirm() {
  const { t } = useTranslation();
  const [state, setState] = useState(null); // { message, resolve }

  const confirm = useCallback(
    (message) =>
      new Promise((resolve) => {
        setState({ message, resolve });
      }),
    []
  );

  const handleConfirm = () => {
    state.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(null);
  };

  const dialog = state ? (
    <div className="confirm-overlay" role="alertdialog" aria-modal="true">
      <div className="confirm-box">
        <p>{state.message}</p>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={handleCancel}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleConfirm}>{t('common.delete')}</Button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}

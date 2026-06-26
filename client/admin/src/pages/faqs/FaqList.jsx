import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { faqsApi } from '../../api/modules';
import { useConfirm } from '../../components/ConfirmDialog';
import { Field, TextInput, TextArea, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Faq.css';

const EMPTY_FAQ = { question_en: '', question_np: '', answer_en: '', answer_np: '', sort_order: 0, is_published: true };

export default function FaqList() {
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(EMPTY_FAQ);
  const [isSaving, setIsSaving] = useState(false);

  const load = () => faqsApi.list().then((res) => { setFaqs(res.data.data); setIsLoading(false); });

  useEffect(() => { load(); }, []);

  const startEdit = (faq) => {
    setEditing(faq.id);
    setDraft(faq);
  };

  const startCreate = () => {
    setEditing('new');
    setDraft(EMPTY_FAQ);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(EMPTY_FAQ);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      if (editing === 'new') {
        await faqsApi.create(draft);
        toast.success(t('faqs.added'));
      } else {
        await faqsApi.update(editing, draft);
        toast.success(t('faqs.updated'));
      }
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (faq) => {
    const ok = await confirm(t('faqs.deleteConfirm'));
    if (!ok) return;
    await faqsApi.remove(faq.id);
    toast.success(t('faqs.deleted'));
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('faqs.title')}</h1>
          <div className="subtitle">{t('faqs.subtitle')}</div>
        </div>
        {editing === null && (
          <Button onClick={startCreate}><Plus size={16} /> {t('faqs.newFaq')}</Button>
        )}
      </div>

      {editing !== null && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="form-grid">
            <Field label={t('faqs.questionEn')} required>
              <TextInput value={draft.question_en} onChange={(e) => setDraft((d) => ({ ...d, question_en: e.target.value }))} />
            </Field>
            <Field label={t('faqs.questionNp')} required>
              <TextInput value={draft.question_np} onChange={(e) => setDraft((d) => ({ ...d, question_np: e.target.value }))} />
            </Field>
            <Field label={t('faqs.answerEn')} required>
              <TextArea value={draft.answer_en} onChange={(e) => setDraft((d) => ({ ...d, answer_en: e.target.value }))} />
            </Field>
            <Field label={t('faqs.answerNp')} required>
              <TextArea value={draft.answer_np} onChange={(e) => setDraft((d) => ({ ...d, answer_np: e.target.value }))} />
            </Field>
            <div className="form-grid-full">
              <Checkbox
                label={t('common.published')}
                checked={draft.is_published}
                onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
              />
            </div>
          </div>
          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            <Button onClick={save} isLoading={isSaving}>{t('common.save')}</Button>
            <Button variant="secondary" onClick={cancelEdit}><X size={14} /> {t('common.cancel')}</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="table-state">{t('common.loading')}</div>
      ) : (
        <div className="surface-card" style={{ padding: 4 }}>
          {faqs.length === 0 && <div className="table-state">{t('faqs.noFaqsYet')}</div>}
          {faqs.map((faq) => (
            <div key={faq.id} className="faq-row">
              <div>
                <div className="faq-question">{faq.question_en}</div>
                <div className="cell-muted">{faq.question_np}</div>
              </div>
              <div className="row-actions">
                <Button variant="ghost" size="sm" onClick={() => startEdit(faq)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(faq)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}

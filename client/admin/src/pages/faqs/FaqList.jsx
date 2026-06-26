import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { faqsApi } from '../../api/modules';
import { useConfirm } from '../../components/ConfirmDialog';
import { Field, TextInput, TextArea, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import './Faq.css';

const EMPTY_FAQ = { question_en: '', question_np: '', answer_en: '', answer_np: '', sort_order: 0, is_published: true };

export default function FaqList() {
  const { confirm, dialog } = useConfirm();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = not editing, 'new' = creating, or a faq object
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
        toast.success('FAQ added');
      } else {
        await faqsApi.update(editing, draft);
        toast.success('FAQ updated');
      }
      cancelEdit();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (faq) => {
    const ok = await confirm(`Delete this FAQ?`);
    if (!ok) return;
    await faqsApi.remove(faq.id);
    toast.success('FAQ deleted');
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>FAQs</h1>
          <div className="subtitle">Frequently asked questions shown on the public site</div>
        </div>
        {editing === null && (
          <Button onClick={startCreate}><Plus size={16} /> New FAQ</Button>
        )}
      </div>

      {editing !== null && (
        <div className="surface-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="form-grid">
            <Field label="Question (English)" required>
              <TextInput value={draft.question_en} onChange={(e) => setDraft((d) => ({ ...d, question_en: e.target.value }))} />
            </Field>
            <Field label="Question (Nepali)" required>
              <TextInput value={draft.question_np} onChange={(e) => setDraft((d) => ({ ...d, question_np: e.target.value }))} />
            </Field>
            <Field label="Answer (English)" required>
              <TextArea value={draft.answer_en} onChange={(e) => setDraft((d) => ({ ...d, answer_en: e.target.value }))} />
            </Field>
            <Field label="Answer (Nepali)" required>
              <TextArea value={draft.answer_np} onChange={(e) => setDraft((d) => ({ ...d, answer_np: e.target.value }))} />
            </Field>
            <div className="form-grid-full">
              <Checkbox
                label="Published"
                checked={draft.is_published}
                onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))}
              />
            </div>
          </div>
          <div className="row-actions" style={{ justifyContent: 'flex-start' }}>
            <Button onClick={save} isLoading={isSaving}>Save</Button>
            <Button variant="secondary" onClick={cancelEdit}><X size={14} /> Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="table-state">Loading…</div>
      ) : (
        <div className="surface-card" style={{ padding: 4 }}>
          {faqs.length === 0 && <div className="table-state">No FAQs yet.</div>}
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

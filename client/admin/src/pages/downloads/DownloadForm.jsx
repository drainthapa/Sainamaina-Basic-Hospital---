import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { downloadsApi, categoriesApi } from '../../api/modules';
import { Field, TextInput, Select } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

const DOC_TYPE_LABELS = {
  act: 'Acts', policy: 'Policies', guideline: 'Guidelines', form: 'Forms',
  action_plan: 'Action plan', budget_program: 'Budget & program', annual_report: 'Annual reports',
  other_report: 'Other reports', publication: 'Publications', citizen_charter: 'Citizen charter',
  unicode_download: 'Unicode downloads', other: 'Other',
};

export default function DownloadForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      doc_type: 'policy', category_id: '', title_en: '', title_np: '',
      file_url: '', file_name: '', bs_date: '', ad_date: new Date().toISOString().slice(0, 10),
      sort_order: 0,
    },
  });

  const docType = watch('doc_type');

  useEffect(() => {
    categoriesApi.listDownloadCategories(docType).then((res) => setCategories(res.data.data));
  }, [docType]);

  useEffect(() => {
    if (!isEdit) return;
    downloadsApi.getById(id).then((res) => {
      const data = res.data.data;
      reset({ ...data, category_id: data.category_id || '', ad_date: data.ad_date?.slice(0, 10) });
      setIsLoading(false);
    }).catch(() => {
      toast.error('Failed to load document');
      navigate('/downloads');
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    if (!data.file_url) {
      toast.error('Please upload a file before saving');
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...data, category_id: data.category_id || null };
      if (isEdit) {
        await downloadsApi.update(id, payload);
        toast.success('Document updated');
      } else {
        await downloadsApi.create(payload);
        toast.success('Document created');
      }
      navigate('/downloads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="table-state">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>{isEdit ? 'Edit document' : 'New document'}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Document type" required>
            <Select {...register('doc_type')}>
              {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Select {...register('category_id')}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </Select>
          </Field>

          <Field label="Title (English)" required error={errors.title_en?.message}>
            <TextInput {...register('title_en', { required: 'Required' })} />
          </Field>
          <Field label="Title (Nepali)" required error={errors.title_np?.message}>
            <TextInput {...register('title_np', { required: 'Required' })} />
          </Field>

          <Field label="BS date" hint="e.g. १४ फागुन २०७७">
            <TextInput {...register('bs_date')} />
          </Field>
          <Field label="AD date" required>
            <TextInput type="date" {...register('ad_date', { required: true })} />
          </Field>

          <Field label="File" required hint="PDF, Word, or Excel">
            <FileUpload
              value={watch('file_url')}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(url, name) => { setValue('file_url', url); setValue('file_name', name); }}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first">
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/downloads')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { newsApi, categoriesApi } from '../../api/modules';
import { Field, TextInput, Select, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';

const MODULE_LABELS = {
  news: 'News', notice: 'Notice', press_release: 'Press release',
  tender_notice: 'Tender notice', health_article: 'Health awareness article', event: 'Event',
};

export default function NewsForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  const defaultModuleType = searchParams.get('module_type') || 'news';

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      module_type: defaultModuleType, category_id: '', title_en: '', title_np: '',
      summary_en: '', summary_np: '', body_en: '', body_np: '',
      bs_date: '', ad_date: new Date().toISOString().slice(0, 10), expiry_date: '',
      is_featured: false, status: 'published',
    },
  });

  const moduleType = watch('module_type');

  useEffect(() => {
    categoriesApi.listNewsCategories(moduleType).then((res) => setCategories(res.data.data));
  }, [moduleType]);

  useEffect(() => {
    if (!isEdit) return;
    newsApi.getById(id).then((res) => {
      const data = res.data.data;
      reset({
        ...data,
        category_id: data.category_id || '',
        ad_date: data.ad_date?.slice(0, 10),
        expiry_date: data.expiry_date?.slice(0, 10) || '',
      });
      setIsLoading(false);
    }).catch(() => {
      toast.error('Failed to load item');
      navigate('/news');
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = {
      ...data,
      category_id: data.category_id || null,
      expiry_date: data.expiry_date || null,
    };
    try {
      if (isEdit) {
        await newsApi.update(id, payload);
        toast.success('Updated');
      } else {
        await newsApi.create(payload);
        toast.success('Created');
      }
      navigate('/news');
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
        <div><h1>{isEdit ? `Edit ${MODULE_LABELS[moduleType]?.toLowerCase()}` : `New ${MODULE_LABELS[moduleType]?.toLowerCase()}`}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Content type" required>
            <Select {...register('module_type')} disabled={isEdit}>
              {Object.entries(MODULE_LABELS).map(([value, label]) => (
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

          <Field label="Expiry date" hint="Optional, mainly for notices">
            <TextInput type="date" {...register('expiry_date')} />
          </Field>
          <Field label="Status">
            <Select {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>

          <Field label="Summary (English)" hint="Optional, short teaser text">
            <TextInput {...register('summary_en')} />
          </Field>
          <Field label="Summary (Nepali)" hint="Optional, short teaser text">
            <TextInput {...register('summary_np')} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label="Featured (show prominently on homepage)" {...register('is_featured')} />
          </div>
        </div>

        <Field label="Body (English)">
          <Controller
            name="body_en"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
          />
        </Field>

        <Field label="Body (Nepali)">
          <Controller
            name="body_np"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
          />
        </Field>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/news')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

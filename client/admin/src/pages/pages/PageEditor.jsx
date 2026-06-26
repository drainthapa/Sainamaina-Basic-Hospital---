import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { pagesApi } from '../../api/modules';
import { Field, TextInput } from '../../components/FormField';
import Button from '../../components/Button';

export default function PageEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { title_en: '', title_np: '', content_en: '', content_np: '', meta_title: '', meta_description: '' },
  });

  useEffect(() => {
    pagesApi.getBySlug(slug).then((res) => {
      reset(res.data.data);
      setIsLoading(false);
    }).catch(() => {
      toast.error('Failed to load page');
      navigate('/pages');
    });
  }, [slug, navigate, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await pagesApi.update(slug, data);
      toast.success('Page updated');
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
        <div><h1>Edit page</h1><div className="subtitle">/{slug}</div></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Title (English)">
            <TextInput {...register('title_en')} />
          </Field>
          <Field label="Title (Nepali)">
            <TextInput {...register('title_np')} />
          </Field>
        </div>

        <Field label="Content (English)">
          <Controller
            name="content_en"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} />}
          />
        </Field>

        <Field label="Content (Nepali)">
          <Controller
            name="content_np"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} />}
          />
        </Field>

        <div className="form-grid">
          <Field label="Meta title" hint="SEO">
            <TextInput {...register('meta_title')} />
          </Field>
          <Field label="Meta description" hint="SEO">
            <TextInput {...register('meta_description')} />
          </Field>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/pages')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

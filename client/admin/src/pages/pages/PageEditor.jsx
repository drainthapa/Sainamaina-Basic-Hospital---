import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { pagesApi } from '../../api/modules';
import { Field, TextInput } from '../../components/FormField';
import Button from '../../components/Button';

export default function PageEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t('common.loadFailed'));
      navigate('/pages');
    });
  }, [slug, navigate, reset, t]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await pagesApi.update(slug, data);
      toast.success(t('pages.updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="table-state">{t('common.loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>{t('pages.editPage')}</h1><div className="subtitle">/{slug}</div></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('common.titleEn')}>
            <TextInput {...register('title_en')} />
          </Field>
          <Field label={t('common.titleNp')}>
            <TextInput {...register('title_np')} />
          </Field>
        </div>

        <Field label={t('pages.contentEn')}>
          <Controller
            name="content_en"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} />}
          />
        </Field>

        <Field label={t('pages.contentNp')}>
          <Controller
            name="content_np"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange} />}
          />
        </Field>

        <div className="form-grid">
          <Field label={t('pages.metaTitle')} hint={t('pages.seo')}>
            <TextInput {...register('meta_title')} />
          </Field>
          <Field label={t('pages.metaDescription')} hint={t('pages.seo')}>
            <TextInput {...register('meta_description')} />
          </Field>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/pages')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

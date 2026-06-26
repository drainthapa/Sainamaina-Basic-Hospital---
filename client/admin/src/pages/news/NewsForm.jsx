import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { newsApi, categoriesApi } from '../../api/modules';
import { Field, TextInput, Select, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';

const MODULE_TYPES = ['news', 'notice', 'press_release', 'tender_notice', 'health_article', 'event'];

export default function NewsForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t('common.loadFailed'));
      navigate('/news');
    });
  }, [id, isEdit, navigate, reset, t]);

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
        toast.success(t('news.updated'));
      } else {
        await newsApi.create(payload);
        toast.success(t('news.created'));
      }
      navigate('/news');
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
        <div><h1>{isEdit ? `${t('common.edit')} ${t(`news.tabs.${moduleType}`)}` : `${t('common.new')} ${t(`news.tabs.${moduleType}`)}`}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('news.contentType')} required>
            <Select {...register('module_type')} disabled={isEdit}>
              {MODULE_TYPES.map((value) => (
                <option key={value} value={value}>{t(`news.tabs.${value}`)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('news.category')}>
            <Select {...register('category_id')}>
              <option value="">{t('common.none')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </Select>
          </Field>

          <Field label={t('common.titleEn')} required error={errors.title_en?.message}>
            <TextInput {...register('title_en', { required: t('common.required') })} />
          </Field>
          <Field label={t('common.titleNp')} required error={errors.title_np?.message}>
            <TextInput {...register('title_np', { required: t('common.required') })} />
          </Field>

          <Field label={t('news.bsDate')} hint={t('news.bsDateHint')}>
            <TextInput {...register('bs_date')} />
          </Field>
          <Field label={t('news.adDate')} required>
            <TextInput type="date" {...register('ad_date', { required: true })} />
          </Field>

          <Field label={t('news.expiryDate')} hint={t('news.expiryHint')}>
            <TextInput type="date" {...register('expiry_date')} />
          </Field>
          <Field label={t('common.status')}>
            <Select {...register('status')}>
              <option value="draft">{t('common.draft')}</option>
              <option value="published">{t('common.published')}</option>
              <option value="archived">{t('common.archived')}</option>
            </Select>
          </Field>

          <Field label={t('news.summaryEn')} hint={t('news.summaryHint')}>
            <TextInput {...register('summary_en')} />
          </Field>
          <Field label={t('news.summaryNp')} hint={t('news.summaryHint')}>
            <TextInput {...register('summary_np')} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label={t('news.featured')} {...register('is_featured')} />
          </div>
        </div>

        <Field label={t('news.bodyEn')}>
          <Controller
            name="body_en"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
          />
        </Field>

        <Field label={t('news.bodyNp')}>
          <Controller
            name="body_np"
            control={control}
            render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} />}
          />
        </Field>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/news')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

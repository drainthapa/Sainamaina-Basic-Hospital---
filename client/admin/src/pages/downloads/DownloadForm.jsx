import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { downloadsApi, categoriesApi } from '../../api/modules';
import { Field, TextInput, Select } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

const DOC_TYPES = [
  'act', 'policy', 'guideline', 'form', 'action_plan', 'budget_program', 'annual_report',
  'other_report', 'publication', 'citizen_charter', 'unicode_download', 'other',
];

export default function DownloadForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t('common.loadFailed'));
      navigate('/downloads');
    });
  }, [id, isEdit, navigate, reset, t]);

  const onSubmit = async (data) => {
    if (!data.file_url) {
      toast.error(t('downloads.fileRequired'));
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...data, category_id: data.category_id || null };
      if (isEdit) {
        await downloadsApi.update(id, payload);
        toast.success(t('downloads.updated'));
      } else {
        await downloadsApi.create(payload);
        toast.success(t('downloads.created'));
      }
      navigate('/downloads');
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
        <div><h1>{isEdit ? t('downloads.editDocument') : t('downloads.newDocument')}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('downloads.docType')} required>
            <Select {...register('doc_type')}>
              {DOC_TYPES.map((value) => (
                <option key={value} value={value}>{t(`downloads.types.${value}`)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t('downloads.category')}>
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

          <Field label={t('downloads.bsDate')} hint={t('news.bsDateHint')}>
            <TextInput {...register('bs_date')} />
          </Field>
          <Field label={t('downloads.adDate')} required>
            <TextInput type="date" {...register('ad_date', { required: true })} />
          </Field>

          <Field label={t('downloads.file')} required hint={t('downloads.fileHint')}>
            <FileUpload
              value={watch('file_url')}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(url, name) => { setValue('file_url', url); setValue('file_name', name); }}
            />
          </Field>
          <Field label={t('common.sortOrder')} hint={t('common.sortOrderHint')}>
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/downloads')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

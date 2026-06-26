import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Checkbox } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

export default function DepartmentForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name_en: '', name_np: '', description_en: '', description_np: '',
      image_url: '', sort_order: 0, is_published: true,
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    departmentsApi.getById(id).then((res) => {
      reset(res.data.data);
      setIsLoading(false);
    }).catch(() => {
      toast.error(t('common.loadFailed'));
      navigate('/departments');
    });
  }, [id, isEdit, navigate, reset, t]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await departmentsApi.update(id, data);
        toast.success(t('departments.updated'));
      } else {
        await departmentsApi.create(data);
        toast.success(t('departments.created'));
      }
      navigate('/departments');
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
        <div>
          <h1>{isEdit ? t('departments.editDepartment') : t('departments.newDepartment')}</h1>
        </div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('common.nameEn')} required error={errors.name_en?.message}>
            <TextInput {...register('name_en', { required: t('common.required') })} />
          </Field>
          <Field label={t('common.nameNp')} required error={errors.name_np?.message}>
            <TextInput {...register('name_np', { required: t('common.required') })} />
          </Field>

          <Field label={t('common.descriptionEn')} hint={t('common.optional')}>
            <TextArea {...register('description_en')} />
          </Field>
          <Field label={t('common.descriptionNp')} hint={t('common.optional')}>
            <TextArea {...register('description_np')} />
          </Field>

          <Field label={t('departments.departmentImage')}>
            <FileUpload
              value={watch('image_url')}
              accept="image/*"
              onChange={(url) => setValue('image_url', url)}
            />
          </Field>
          <Field label={t('common.sortOrder')} hint={t('common.sortOrderHint')}>
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label={t('departments.publishedHint')} {...register('is_published')} />
          </div>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/departments')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

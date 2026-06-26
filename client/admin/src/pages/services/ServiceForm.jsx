import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { servicesApi, departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Select, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name_en: '', name_np: '', description_en: '', description_np: '',
      department_id: '', icon: '', category: '', is_emergency: false,
      sort_order: 0, is_published: true,
    },
  });

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((res) => setDepartments(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    servicesApi.getById(id).then((res) => {
      reset({ ...res.data.data, department_id: res.data.data.department_id || '' });
      setIsLoading(false);
    }).catch(() => {
      toast.error(t('common.loadFailed'));
      navigate('/services');
    });
  }, [id, isEdit, navigate, reset, t]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = { ...data, department_id: data.department_id || null };
    try {
      if (isEdit) {
        await servicesApi.update(id, payload);
        toast.success(t('services.updated'));
      } else {
        await servicesApi.create(payload);
        toast.success(t('services.created'));
      }
      navigate('/services');
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
        <div><h1>{isEdit ? t('services.editService') : t('services.newService')}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('common.nameEn')} required error={errors.name_en?.message}>
            <TextInput {...register('name_en', { required: t('common.required') })} />
          </Field>
          <Field label={t('common.nameNp')} required error={errors.name_np?.message}>
            <TextInput {...register('name_np', { required: t('common.required') })} />
          </Field>

          <Field label={t('services.department')} hint={t('common.optional')}>
            <Select {...register('department_id')}>
              <option value="">{t('common.none')}</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </Select>
          </Field>
          <Field label={t('common.sortOrder')}>
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>

          <Field label={t('common.descriptionEn')} hint={t('common.optional')}>
            <TextArea {...register('description_en')} />
          </Field>
          <Field label={t('common.descriptionNp')} hint={t('common.optional')}>
            <TextArea {...register('description_np')} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label={t('services.emergencyService')} {...register('is_emergency')} />
          </div>
          <div className="form-grid-full">
            <Checkbox label={t('common.published')} {...register('is_published')} />
          </div>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/services')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { staffApi, departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Select, Checkbox } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

const STAFF_TYPES = ['doctor', 'nursing', 'administrative', 'technical', 'support'];

export default function StaffForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [departments, setDepartments] = useState([]);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      full_name: '', staff_type: 'support', designation_en: '', designation_np: '',
      qualification: '', specialization: '', biography_en: '', biography_np: '',
      photo_url: '', email: '', phone: '', department_id: '', is_published: true,
      schedules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'schedules' });
  const staffType = watch('staff_type');
  const days = t('staff.days', { returnObjects: true });

  useEffect(() => {
    departmentsApi.list({ limit: 100 }).then((res) => setDepartments(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    staffApi.getById(id).then((res) => {
      const data = res.data.data;
      reset({
        ...data,
        department_id: data.department_id || '',
        schedules: (data.schedules || []).map((s) => ({
          day_of_week: s.day_of_week, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5),
        })),
      });
      setIsLoading(false);
    }).catch(() => {
      toast.error(t('common.loadFailed'));
      navigate('/staff');
    });
  }, [id, isEdit, navigate, reset, t]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = { ...data, department_id: data.department_id || null };
    try {
      if (isEdit) {
        await staffApi.update(id, payload);
        toast.success(t('staff.updated'));
      } else {
        await staffApi.create(payload);
        toast.success(t('staff.created'));
      }
      navigate('/staff');
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
        <div><h1>{isEdit ? t('staff.editStaff') : t('staff.newStaff')}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label={t('staff.fullName')} required error={errors.full_name?.message}>
            <TextInput {...register('full_name', { required: t('common.required') })} />
          </Field>
          <Field label={t('staff.staffType')} required>
            <Select {...register('staff_type')}>
              {STAFF_TYPES.map((value) => <option key={value} value={value}>{t(`staff.types.${value}`)}</option>)}
            </Select>
          </Field>

          <Field label={t('staff.designationEn')} required error={errors.designation_en?.message}>
            <TextInput {...register('designation_en', { required: t('common.required') })} />
          </Field>
          <Field label={t('staff.designationNp')} required error={errors.designation_np?.message}>
            <TextInput {...register('designation_np', { required: t('common.required') })} />
          </Field>

          <Field label={t('staff.department')}>
            <Select {...register('department_id')}>
              <option value="">{t('common.none')}</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </Select>
          </Field>
          <Field label={t('staff.qualification')} hint={t('staff.qualificationHint')}>
            <TextInput {...register('qualification')} />
          </Field>

          {staffType === 'doctor' && (
            <Field label={t('staff.specialization')} hint={t('staff.specializationHint')}>
              <TextInput {...register('specialization')} />
            </Field>
          )}

          <Field label={t('staff.email')}>
            <TextInput type="email" {...register('email')} />
          </Field>
          <Field label={t('staff.phone')}>
            <TextInput {...register('phone')} />
          </Field>

          <Field label={t('staff.biographyEn')} hint={t('common.optional')}>
            <TextArea {...register('biography_en')} />
          </Field>
          <Field label={t('staff.biographyNp')} hint={t('common.optional')}>
            <TextArea {...register('biography_np')} />
          </Field>

          <Field label={t('staff.photo')}>
            <FileUpload value={watch('photo_url')} accept="image/*" onChange={(url) => setValue('photo_url', url)} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label={t('departments.publishedHint')} {...register('is_published')} />
          </div>
        </div>

        <h3 style={{ marginTop: 24 }}>{t('staff.weeklyAvailability')}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: -8 }}>
          {t('staff.weeklyAvailabilityHint')}
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="form-grid" style={{ alignItems: 'end', marginBottom: 4 }}>
            <Field label={t('staff.day')}>
              <Select {...register(`schedules.${index}.day_of_week`, { valueAsNumber: true })}>
                {days.map((day, i) => <option key={i} value={i}>{day}</option>)}
              </Select>
            </Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <Field label={t('staff.startTime')}>
                <TextInput type="time" {...register(`schedules.${index}.start_time`)} />
              </Field>
              <Field label={t('staff.endTime')}>
                <TextInput type="time" {...register(`schedules.${index}.end_time`)} />
              </Field>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} style={{ marginTop: 30 }}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button" variant="secondary" size="sm"
          onClick={() => append({ day_of_week: 0, start_time: '09:00', end_time: '17:00' })}
        >
          <Plus size={14} /> {t('staff.addDay')}
        </Button>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
          <Button type="submit" isLoading={isSaving}>{t('common.save')}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/staff')}>{t('common.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}

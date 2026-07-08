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
import './StaffForm.css';

const STAFF_TYPES = ['doctor', 'nursing', 'administrative', 'technical', 'support'];
const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

/** Derive up to 2 uppercase initials from a full name.
 *  "ABC Thapa"   → "AT"
 *  "Ram"         → "R"
 *  "Dr. Sita Rai"→ "SR"  (skips honorific prefixes)
 */
function getInitials(name = '') {
  const HONORIFICS = /^(dr|mr|mrs|ms|prof|er|eng|adv)\.?$/i;
  const parts = name.trim().split(/\s+/).filter((w) => w && !HONORIFICS.test(w));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Pick a deterministic background colour from the name so the avatar always
 *  looks the same for the same person and stays visually distinct across rows. */
const AVATAR_COLORS = [
  '#0956CE', '#0F6E56', '#7C3AED', '#B45309',
  '#0E7490', '#BE185D', '#15803D', '#9A3412',
];
function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

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
      photo_url: '', email: '', phone: '', department_id: '',
      sort_order: 0, is_published: true,
      schedules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'schedules' });
  const staffType = watch('staff_type');
  const fullName = watch('full_name');
  const photoUrl = watch('photo_url');
  const days = t('staff.days', { returnObjects: true });

  // Derived avatar values — recalculate whenever fullName changes
  const initials = getInitials(fullName);
  const bgColor = avatarColor(fullName);

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
        sort_order: data.sort_order ?? 0,
        schedules: (data.schedules || []).map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time?.slice(0, 5),
          end_time: s.end_time?.slice(0, 5),
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
    const payload = {
      ...data,
      department_id: data.department_id || null,
      sort_order: Number(data.sort_order) || 0,
      email: data.email || null,
    };
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

          {/* ── Name + type ── */}
          <Field label={t('staff.fullName')} required error={errors.full_name?.message}>
            <TextInput {...register('full_name', { required: t('common.required') })} />
          </Field>
          <Field label={t('staff.staffType')} required>
            <Select {...register('staff_type')}>
              {STAFF_TYPES.map((value) => (
                <option key={value} value={value}>{t(`staff.types.${value}`)}</option>
              ))}
            </Select>
          </Field>

          {/* ── Designation ── */}
          <Field label={t('staff.designationEn')} required error={errors.designation_en?.message}>
            <TextInput {...register('designation_en', { required: t('common.required') })} />
          </Field>
          <Field label={t('staff.designationNp')} required error={errors.designation_np?.message}>
            <TextInput {...register('designation_np', { required: t('common.required') })} />
          </Field>

          {/* ── Department + qualification ── */}
          <Field label={t('staff.department')}>
            <Select {...register('department_id')}>
              <option value="">{t('common.none')}</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </Select>
          </Field>
          <Field label={t('staff.qualification')} hint={t('staff.qualificationHint')}>
            <TextInput {...register('qualification')} />
          </Field>

          {/* ── Doctor-only specialization ── */}
          {staffType === 'doctor' && (
            <Field label={t('staff.specialization')} hint={t('staff.specializationHint')}>
              <TextInput {...register('specialization')} />
            </Field>
          )}

          {/* ── Email (explicitly optional) + phone ── */}
          <Field label={t('staff.email')} hint={t('common.optional')}>
            <TextInput
              type="email"
              placeholder="example@hospital.gov.np"
              {...register('email')}
            />
          </Field>
          <Field label={t('staff.phone')} hint={t('common.optional')}>
            <TextInput placeholder="98XXXXXXXX" {...register('phone')} />
          </Field>

          {/* ── Biography ── */}
          <Field label={t('staff.biographyEn')} hint={t('common.optional')}>
            <TextArea {...register('biography_en')} />
          </Field>
          <Field label={t('staff.biographyNp')} hint={t('common.optional')}>
            <TextArea {...register('biography_np')} />
          </Field>

          {/* ── Sort order ── */}
          <Field label={t('common.sortOrder')} hint={t('common.sortOrderHint')}>
            <TextInput
              type="number"
              min={0}
              {...register('sort_order', { valueAsNumber: true })}
            />
          </Field>

          {/* ── Photo upload with live avatar preview ── */}
          <Field label={t('staff.photo')} hint={t('staff.photoHint')}>
            <div className="staff-photo-row">
              {/* Live avatar: shows the uploaded photo, or initials if no photo */}
              <div
                className="staff-avatar-preview"
                style={{ background: photoUrl ? 'transparent' : bgColor }}
                title={fullName || 'Avatar preview'}
              >
                {photoUrl ? (
                  <img
                    src={`${FILE_BASE}${photoUrl}`}
                    alt={fullName}
                    className="staff-avatar-img"
                  />
                ) : (
                  <span className="staff-avatar-initials">{initials}</span>
                )}
              </div>

              <div className="staff-photo-upload">
                <FileUpload
                  value={photoUrl}
                  accept="image/*"
                  onChange={(url) => setValue('photo_url', url)}
                />
                {!photoUrl && fullName && (
                  <p className="staff-avatar-hint">
                    {t('staff.avatarAutoHint', { initials })}
                  </p>
                )}
              </div>
            </div>
          </Field>

          {/* ── Publish toggle ── */}
          <div className="form-grid-full">
            <Checkbox label={t('departments.publishedHint')} {...register('is_published')} />
          </div>
        </div>

        {/* ── Weekly schedule ── */}
        <h3 style={{ marginTop: 24 }}>{t('staff.weeklyAvailability')}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>
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
              <Button
                type="button" variant="ghost" size="sm"
                onClick={() => remove(index)}
                style={{ marginTop: 30 }}
              >
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
          <Button type="button" variant="secondary" onClick={() => navigate('/staff')}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

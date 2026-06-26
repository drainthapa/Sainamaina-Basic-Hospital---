import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { staffApi, departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Select, Checkbox } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

const STAFF_TYPES = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'technical', label: 'Technical' },
  { value: 'support', label: 'Support' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
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
      toast.error('Failed to load staff member');
      navigate('/staff');
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = { ...data, department_id: data.department_id || null };
    try {
      if (isEdit) {
        await staffApi.update(id, payload);
        toast.success('Staff member updated');
      } else {
        await staffApi.create(payload);
        toast.success('Staff member created');
      }
      navigate('/staff');
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
        <div><h1>{isEdit ? 'Edit staff member' : 'New staff member'}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Full name" required error={errors.full_name?.message}>
            <TextInput {...register('full_name', { required: 'Required' })} />
          </Field>
          <Field label="Staff type" required>
            <Select {...register('staff_type')}>
              {STAFF_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>

          <Field label="Designation (English)" required error={errors.designation_en?.message}>
            <TextInput {...register('designation_en', { required: 'Required' })} />
          </Field>
          <Field label="Designation (Nepali)" required error={errors.designation_np?.message}>
            <TextInput {...register('designation_np', { required: 'Required' })} />
          </Field>

          <Field label="Department">
            <Select {...register('department_id')}>
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </Select>
          </Field>
          <Field label="Qualification" hint="e.g. MBBS, MD (Internal Medicine)">
            <TextInput {...register('qualification')} />
          </Field>

          {staffType === 'doctor' && (
            <Field label="Specialization" hint="Doctor-specific field">
              <TextInput {...register('specialization')} />
            </Field>
          )}

          <Field label="Email">
            <TextInput type="email" {...register('email')} />
          </Field>
          <Field label="Phone">
            <TextInput {...register('phone')} />
          </Field>

          <Field label="Biography (English)" hint="Optional">
            <TextArea {...register('biography_en')} />
          </Field>
          <Field label="Biography (Nepali)" hint="Optional">
            <TextArea {...register('biography_np')} />
          </Field>

          <Field label="Photo">
            <FileUpload value={watch('photo_url')} accept="image/*" onChange={(url) => setValue('photo_url', url)} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label="Published (visible on the public site)" {...register('is_published')} />
          </div>
        </div>

        <h3 style={{ marginTop: 24 }}>Weekly availability</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: -8 }}>
          Optional. Mainly used for doctors, but works for any staff member.
        </p>

        {fields.map((field, index) => (
          <div key={field.id} className="form-grid" style={{ alignItems: 'end', marginBottom: 4 }}>
            <Field label="Day">
              <Select {...register(`schedules.${index}.day_of_week`, { valueAsNumber: true })}>
                {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
              </Select>
            </Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <Field label="Start time">
                <TextInput type="time" {...register(`schedules.${index}.start_time`)} />
              </Field>
              <Field label="End time">
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
          <Plus size={14} /> Add day
        </Button>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/staff')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

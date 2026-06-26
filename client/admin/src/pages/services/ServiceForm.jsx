import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { servicesApi, departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Select, Checkbox } from '../../components/FormField';
import Button from '../../components/Button';

export default function ServiceForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
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
      toast.error('Failed to load service');
      navigate('/services');
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    const payload = { ...data, department_id: data.department_id || null };
    try {
      if (isEdit) {
        await servicesApi.update(id, payload);
        toast.success('Service updated');
      } else {
        await servicesApi.create(payload);
        toast.success('Service created');
      }
      navigate('/services');
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
        <div><h1>{isEdit ? 'Edit service' : 'New service'}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Name (English)" required error={errors.name_en?.message}>
            <TextInput {...register('name_en', { required: 'Required' })} />
          </Field>
          <Field label="Name (Nepali)" required error={errors.name_np?.message}>
            <TextInput {...register('name_np', { required: 'Required' })} />
          </Field>

          <Field label="Department" hint="Optional">
            <Select {...register('department_id')}>
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name_en}</option>)}
            </Select>
          </Field>
          <Field label="Sort order">
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>

          <Field label="Description (English)" hint="Optional">
            <TextArea {...register('description_en')} />
          </Field>
          <Field label="Description (Nepali)" hint="Optional">
            <TextArea {...register('description_np')} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label="Emergency service (highlighted on the public site)" {...register('is_emergency')} />
          </div>
          <div className="form-grid-full">
            <Checkbox label="Published" {...register('is_published')} />
          </div>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/services')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

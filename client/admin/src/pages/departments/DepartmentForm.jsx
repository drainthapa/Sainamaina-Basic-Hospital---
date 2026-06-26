import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { departmentsApi } from '../../api/modules';
import { Field, TextInput, TextArea, Checkbox } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';

export default function DepartmentForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
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
      toast.error('Failed to load department');
      navigate('/departments');
    });
  }, [id, isEdit, navigate, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await departmentsApi.update(id, data);
        toast.success('Department updated');
      } else {
        await departmentsApi.create(data);
        toast.success('Department created');
      }
      navigate('/departments');
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
        <div>
          <h1>{isEdit ? 'Edit department' : 'New department'}</h1>
        </div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Name (English)" required error={errors.name_en?.message}>
            <TextInput {...register('name_en', { required: 'Required' })} />
          </Field>
          <Field label="Name (Nepali)" required error={errors.name_np?.message}>
            <TextInput {...register('name_np', { required: 'Required' })} />
          </Field>

          <Field label="Description (English)" hint="Optional">
            <TextArea {...register('description_en')} />
          </Field>
          <Field label="Description (Nepali)" hint="Optional">
            <TextArea {...register('description_np')} />
          </Field>

          <Field label="Department image">
            <FileUpload
              value={watch('image_url')}
              accept="image/*"
              onChange={(url) => setValue('image_url', url)}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first">
            <TextInput type="number" {...register('sort_order', { valueAsNumber: true })} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label="Published (visible on the public site)" {...register('is_published')} />
          </div>
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/departments')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

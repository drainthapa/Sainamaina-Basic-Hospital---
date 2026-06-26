import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { galleryApi, uploadApi } from '../../api/modules';
import { Field, TextInput, Select, Checkbox } from '../../components/FormField';
import FileUpload from '../../components/FileUpload';
import Button from '../../components/Button';
import './GalleryForm.css';

const FILE_BASE = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

export default function GalleryForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [media, setMedia] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title_en: '', title_np: '', album_type: 'photo', cover_image_url: '',
      bs_date: '', ad_date: new Date().toISOString().slice(0, 10), is_published: true,
    },
  });

  const albumType = watch('album_type');

  useEffect(() => {
    if (!isEdit) return;
    galleryApi.getAlbum(id).then((res) => {
      const data = res.data.data;
      reset({ ...data, ad_date: data.ad_date?.slice(0, 10) });
      setMedia(data.media || []);
      setIsLoading(false);
    }).catch(() => {
      toast.error('Failed to load album');
      navigate('/gallery');
    });
  }, [id, isEdit, navigate, reset]);

  const handleAddMediaFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        // eslint-disable-next-line no-await-in-loop
        const res = await uploadApi.uploadFile(file);
        uploaded.push({
          media_url: res.data.data.file_url,
          media_type: albumType === 'video' ? 'video' : 'image',
          caption_en: '', caption_np: '',
        });
      }
      if (isEdit) {
        const res = await galleryApi.addMedia(id, uploaded);
        setMedia((m) => [...m, ...res.data.data]);
      } else {
        // Album not saved yet - keep media in local state, attach on create.
        setMedia((m) => [...m, ...uploaded.map((u, i) => ({ ...u, id: `local-${Date.now()}-${i}` }))]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveMedia = async (item) => {
    if (isEdit && !String(item.id).startsWith('local-')) {
      try {
        await galleryApi.removeMedia(item.id);
      } catch (err) {
        toast.error('Failed to remove item');
        return;
      }
    }
    setMedia((m) => m.filter((x) => x.id !== item.id));
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await galleryApi.updateAlbum(id, data);
        toast.success('Album updated');
      } else {
        await galleryApi.createAlbum({ ...data, media });
        toast.success('Album created');
      }
      navigate('/gallery');
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
        <div><h1>{isEdit ? 'Edit album' : 'New album'}</h1></div>
      </div>

      <form className="surface-card" style={{ padding: 24 }} onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <Field label="Title (English)" required error={errors.title_en?.message}>
            <TextInput {...register('title_en', { required: 'Required' })} />
          </Field>
          <Field label="Title (Nepali)" required error={errors.title_np?.message}>
            <TextInput {...register('title_np', { required: 'Required' })} />
          </Field>

          <Field label="Album type" required>
            <Select {...register('album_type')}>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </Select>
          </Field>
          <Field label="Cover image">
            <FileUpload value={watch('cover_image_url')} accept="image/*" onChange={(url) => setValue('cover_image_url', url)} />
          </Field>

          <Field label="BS date" hint="e.g. १४ फागुन २०७७">
            <TextInput {...register('bs_date')} />
          </Field>
          <Field label="AD date" required>
            <TextInput type="date" {...register('ad_date', { required: true })} />
          </Field>

          <div className="form-grid-full">
            <Checkbox label="Published (visible on the public site)" {...register('is_published')} />
          </div>
        </div>

        <h3 style={{ marginTop: 8 }}>Photos / videos</h3>
        <label className="gallery-upload-button">
          <Plus size={14} /> {isUploadingMedia ? 'Uploading…' : 'Add files'}
          <input
            type="file"
            multiple
            accept={albumType === 'video' ? 'video/*' : 'image/*'}
            style={{ display: 'none' }}
            onChange={(e) => handleAddMediaFiles(e.target.files)}
            disabled={isUploadingMedia}
          />
        </label>

        <div className="gallery-media-grid">
          {media.map((item) => (
            <div key={item.id} className="gallery-media-item">
              {item.media_type === 'video' ? (
                <video src={`${FILE_BASE}${item.media_url}`} controls />
              ) : (
                <img src={`${FILE_BASE}${item.media_url}`} alt={item.caption_en || ''} />
              )}
              <button type="button" className="gallery-media-remove" onClick={() => handleRemoveMedia(item)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {media.length === 0 && <div className="cell-muted" style={{ padding: '12px 0' }}>No media added yet.</div>}
        </div>

        <div className="row-actions" style={{ justifyContent: 'flex-start', marginTop: 24 }}>
          <Button type="submit" isLoading={isSaving}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/gallery')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

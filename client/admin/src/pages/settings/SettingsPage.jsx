import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { settingsApi } from '../../api/modules';
import { Field, TextInput } from '../../components/FormField';
import Button from '../../components/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsApi.getAll().then((res) => setSettings(res.data.data));
  }, []);

  if (!settings) return <div className="table-state">Loading…</div>;

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const saveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => settingsApi.update(key, value)));
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const siteName = settings.site_name || { en: '', np: '' };
  const contact = settings.contact || { phone: '', emergency_phone: '', email: '', address_en: '', address_np: '' };
  const social = settings.social_links || { facebook: '', twitter: '', youtube: '' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Site settings</h1>
          <div className="subtitle">Hospital name, contact details, and social media links shown across the public site</div>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>Site name</h3>
        <div className="form-grid">
          <Field label="English">
            <TextInput value={siteName.en} onChange={(e) => update('site_name', { ...siteName, en: e.target.value })} />
          </Field>
          <Field label="Nepali">
            <TextInput value={siteName.np} onChange={(e) => update('site_name', { ...siteName, np: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>Contact information</h3>
        <div className="form-grid">
          <Field label="Phone">
            <TextInput value={contact.phone} onChange={(e) => update('contact', { ...contact, phone: e.target.value })} />
          </Field>
          <Field label="Emergency phone">
            <TextInput value={contact.emergency_phone} onChange={(e) => update('contact', { ...contact, emergency_phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput value={contact.email} onChange={(e) => update('contact', { ...contact, email: e.target.value })} />
          </Field>
          <Field label="Address (English)">
            <TextInput value={contact.address_en} onChange={(e) => update('contact', { ...contact, address_en: e.target.value })} />
          </Field>
          <Field label="Address (Nepali)">
            <TextInput value={contact.address_np} onChange={(e) => update('contact', { ...contact, address_np: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>Social media</h3>
        <div className="form-grid">
          <Field label="Facebook URL">
            <TextInput value={social.facebook} onChange={(e) => update('social_links', { ...social, facebook: e.target.value })} />
          </Field>
          <Field label="Twitter / X URL">
            <TextInput value={social.twitter} onChange={(e) => update('social_links', { ...social, twitter: e.target.value })} />
          </Field>
          <Field label="YouTube URL">
            <TextInput value={social.youtube} onChange={(e) => update('social_links', { ...social, youtube: e.target.value })} />
          </Field>
        </div>
      </div>

      <Button onClick={saveAll} isLoading={isSaving}>Save all settings</Button>
    </div>
  );
}

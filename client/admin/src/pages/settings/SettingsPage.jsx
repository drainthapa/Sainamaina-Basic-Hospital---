import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { settingsApi } from '../../api/modules';
import { Field, TextInput } from '../../components/FormField';
import Button from '../../components/Button';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsApi.getAll().then((res) => setSettings(res.data.data));
  }, []);

  if (!settings) return <div className="table-state">{t('common.loading')}</div>;

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const saveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => settingsApi.update(key, value)));
      toast.success(t('settings.saved'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const siteName = settings.site_name || { name_en: '', name_np: '', municipality_en: '', municipality_np: '' };
  const contact = settings.contact || { phone: '', emergency_phone: '', email: '', address_en: '', address_np: '' };
  const social = settings.social_links || { facebook: '', twitter: '', youtube: '' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('settings.title')}</h1>
          <div className="subtitle">{t('settings.subtitle')}</div>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>{t('settings.siteName')}</h3>
        <div className="form-grid">
          <Field label={t('common.nameEn')}>
            <TextInput value={siteName.name_en} onChange={(e) => update('site_name', { ...siteName, name_en: e.target.value })} />
          </Field>
          <Field label={t('common.nameNp')}>
            <TextInput value={siteName.name_np} onChange={(e) => update('site_name', { ...siteName, name_np: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>{t('settings.contactInfo')}</h3>
        <div className="form-grid">
          <Field label={t('settings.phone')}>
            <TextInput value={contact.phone} onChange={(e) => update('contact', { ...contact, phone: e.target.value })} />
          </Field>
          <Field label={t('settings.emergencyPhone')}>
            <TextInput value={contact.emergency_phone} onChange={(e) => update('contact', { ...contact, emergency_phone: e.target.value })} />
          </Field>
          <Field label={t('settings.email')}>
            <TextInput value={contact.email} onChange={(e) => update('contact', { ...contact, email: e.target.value })} />
          </Field>
          <Field label={t('settings.addressEn')}>
            <TextInput value={contact.address_en} onChange={(e) => update('contact', { ...contact, address_en: e.target.value })} />
          </Field>
          <Field label={t('settings.addressNp')}>
            <TextInput value={contact.address_np} onChange={(e) => update('contact', { ...contact, address_np: e.target.value })} />
          </Field>
        </div>
      </div>

      <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3>{t('settings.socialMedia')}</h3>
        <div className="form-grid">
          <Field label={t('settings.facebookUrl')}>
            <TextInput value={social.facebook} onChange={(e) => update('social_links', { ...social, facebook: e.target.value })} />
          </Field>
          <Field label={t('settings.twitterUrl')}>
            <TextInput value={social.twitter} onChange={(e) => update('social_links', { ...social, twitter: e.target.value })} />
          </Field>
          <Field label={t('settings.youtubeUrl')}>
            <TextInput value={social.youtube} onChange={(e) => update('social_links', { ...social, youtube: e.target.value })} />
          </Field>
        </div>
      </div>

      <Button onClick={saveAll} isLoading={isSaving}>{t('settings.saveAll')}</Button>
    </div>
  );
}

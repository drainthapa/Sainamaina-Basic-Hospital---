import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contactApi } from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const settings = useSiteSettings();
  const { t } = useTranslation();
  const { field } = useLanguage();
  const contact = settings.contact || {};
  const [form, setForm] = useState({ fullName: '', address: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleChange = (formField) => (e) => setForm((f) => ({ ...f, [formField]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await contactApi.submit(form);
      setStatus('sent');
      setForm({ fullName: '', address: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{t('nav.contact')}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">{t('common.home')}</Link></li>
              <li>{t('nav.contact')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          <div className="col-md-6">
            <h3>{t('contact.contactInfo')}</h3>
            <p><i className="fa fa-map-marker" /> &nbsp;{field(contact, 'address') || 'सैनामैना नगरपालिका-४,मुर्गिया,रुपन्देही,नेपाल'}</p>
            <p><i className="fa fa-phone" /> &nbsp;{contact.phone || '+९७७-०७१-४४०४१७'}</p>
            {contact.emergency_phone && <p><i className="fa fa-ambulance" /> &nbsp;{t('contact.emergency')}: {contact.emergency_phone}</p>}
            <p><i className="fa fa-envelope" /> &nbsp;{contact.email || 'sainamainamunicipalhospital081@gmail.com'}</p>

            <iframe
              title="Hospital location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3358.214075939717!2d83.33907119999999!3d27.6856154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399689002a218b5d%3A0xfb8023a49bd74ffc!2sSainamaina%20Municipal%20Hospital!5e1!3m2!1sen!2snp!4v1782439729166!5m2!1sen!2snp"
              width="100%"
              height="280"
              style={{ border: 0, marginTop: 16 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="col-md-6">
            <h3>{t('contact.feedback')}</h3>
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <div className="row clearfix">
                  <div className="col-md-6 col-sm-12 col-xs-12 form-group">
                    <input
                      type="text" className="form-control" placeholder={t('contact.fullName')} required
                      value={form.fullName} onChange={handleChange('fullName')}
                    />
                  </div>
                  <div className="col-md-6 col-sm-12 col-xs-12 form-group">
                    <input
                      type="text" className="form-control" placeholder={t('contact.address')}
                      value={form.address} onChange={handleChange('address')}
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12 form-group">
                    <input
                      type="email" className="form-control" placeholder={t('contact.email')} required
                      value={form.email} onChange={handleChange('email')}
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 form-group">
                    <textarea
                      name="message" placeholder={t('contact.message')} className="form-control" rows={5} required
                      value={form.message} onChange={handleChange('message')}
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 form-group">
                    <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                      {status === 'sending' ? t('contact.sending') : t('contact.submit')}
                    </button>
                  </div>
                  {status === 'sent' && <div className="col-md-12 alert alert-success" style={{ marginTop: 10 }}>{t('contact.thankYou')}</div>}
                  {status === 'error' && <div className="col-md-12 alert alert-danger" style={{ marginTop: 10 }}>{t('contact.submitFailed')}</div>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

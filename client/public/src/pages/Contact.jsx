import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactApi } from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Contact() {
  const settings = useSiteSettings();
  const contact = settings.contact || {};
  const [form, setForm] = useState({ fullName: '', address: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
            <h1>सम्पर्क</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>सम्पर्क</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          <div className="col-md-6">
            <h3>सम्पर्क जानकारी</h3>
            <p><i className="fa fa-map-marker" /> &nbsp;{contact.address_np || 'सैनामैना नगरपालिका-४,मुर्गिया,रुपन्देही,नेपाल'}</p>
            <p><i className="fa fa-phone" /> &nbsp;{contact.phone || '+९७७-०७१-४४०४१७'}</p>
            {contact.emergency_phone && <p><i className="fa fa-ambulance" /> &nbsp;आकस्मिक: {contact.emergency_phone}</p>}
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
            <h3>सुझाव तथा प्रतिकृया</h3>
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <div className="row clearfix">
                  <div className="col-md-6 col-sm-12 col-xs-12 form-group">
                    <input
                      type="text" className="form-control" placeholder="पुरा नाम" required
                      value={form.fullName} onChange={handleChange('fullName')}
                    />
                  </div>
                  <div className="col-md-6 col-sm-12 col-xs-12 form-group">
                    <input
                      type="text" className="form-control" placeholder="ठेगाना"
                      value={form.address} onChange={handleChange('address')}
                    />
                  </div>
                  <div className="col-md-12 col-sm-12 col-xs-12 form-group">
                    <input
                      type="email" className="form-control" placeholder="इमेल" required
                      value={form.email} onChange={handleChange('email')}
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 form-group">
                    <textarea
                      name="message" placeholder="सुझाव तथा प्रतिकृया" className="form-control" rows={5} required
                      value={form.message} onChange={handleChange('message')}
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 form-group">
                    <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                      {status === 'sending' ? 'पठाउँदै...' : 'पेश गर्नुहोस्'}
                    </button>
                  </div>
                  {status === 'sent' && <div className="col-md-12 alert alert-success" style={{ marginTop: 10 }}>धन्यवाद! तपाईंको प्रतिकृया प्राप्त भयो।</div>}
                  {status === 'error' && <div className="col-md-12 alert alert-danger" style={{ marginTop: 10 }}>पेश गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।</div>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

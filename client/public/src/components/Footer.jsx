import { useSiteSettings } from '../hooks/useSiteSettings';

const EXTERNAL_LINKS = [
  { label: 'स्वास्थ्य तथा खाद्य स्वच्छता मन्त्रालय', url: 'https://mohp.gov.np/' },
  { label: 'स्वास्थ्य निर्देशनालय, लुम्बिनी प्रदेश ,राप्ती उपत्यका (देउखुरी)', url: 'https://hd.lumbini.gov.np/' },
  { label: 'स्वास्थ्य सेवा विभाग', url: 'https://dohs.gov.np/' },
  { label: 'स्वास्थ्य विमा बोर्ड', url: 'https://hib.gov.np/' },
  { label: 'सैनामैना नगरपालिका कार्यपालिकाकाे कार्यालय,बुद्धनगर, रुपन्देही', url: 'https://sainamainamun.gov.np/' },
];

export default function Footer() {
  const settings = useSiteSettings();
  const contact = settings.contact || {};

  return (
    <footer className="main-footer">
      <div className="footer-upper">
        <div className="container">
          <div className="outer-box">
            <div className="row clearfix">
              <div className="big-column col-md-12 col-sm-12 col-xs-12">
                <div className="row clearfix">
                  <div className="footer-column col-md-3 col-sm-6 col-xs-12">
                    <div className="footer-widget adress-widget">
                      <h3><i className="fa fa-map" /> सम्पर्क ठेगाना</h3>
                      <ul>
                        <li><a href="#"><span className="theme_color fa fa-bank" /> &ensp;सैनामैना आधारभुत अस्पताल</a></li>
                        <li><a href="#"><span className="theme_color fa fa-map-marker" /> &ensp;{contact.address_np || 'सैनामैना नगरपालिका-४,मुर्गिया,रुपन्देही,नेपाल'}</a></li>
                        <li><a href="#"><span className="theme_color fa fa-phone" /> &ensp;{contact.phone || '+९७७-०७१-४४०४१७'}</a></li>
                        <li><a href="#"><span className="theme_color fa fa-envelope" /> &ensp;{contact.email || 'sainamainamunicipalhospital081@gmail.com'}</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="footer-column col-md-4 col-xl-6 col-xs-12">
                    <h3 className="content_title"><i className="fa fa-link" /> <span>&nbsp;&nbsp;सम्बन्धित लिंक</span></h3>
                    <div className="panel-body" style={{ border: '1px solid #ccc' }}>
                      <ul className="link-ul">
                        {EXTERNAL_LINKS.map((link) => (
                          <li key={link.url}>
                            <a href={link.url} target="_blank" rel="noreferrer" title={`visit: ${link.label}`}>
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="footer-column col-md-5 col-sm-6 col-xs-12">
                    <div className="footer-widget post-widget">
                      <h3><i className="fa fa-map-marker" /> कार्यालय रहेको स्थान</h3>
                      <iframe
                        title="Hospital location map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3358.214075939717!2d83.33907119999999!3d27.6856154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399689002a218b5d%3A0xfb8023a49bd74ffc!2sSainamaina%20Municipal%20Hospital!5e1!3m2!1sen!2snp!4v1782439729166!5m2!1sen!2snp"
                        width="100%"
                        height="250"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-6">
              <div className="last-updated">
                <h5>अन्तिम अध्यावधिक मिति : {new Date().toLocaleTimeString('en-US')}</h5>
              </div>
            </div>
            <div className="col-xs-12 col-md-6">
              <div className="copyright">
                सर्वाधिकार <a href="/">सैनामैना आधारभुत अस्पताल - सैनामैना नगरपालिका</a>मा सुरक्षित &copy; {new Date().getFullYear()}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/client';

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    contentApi.listFaqs().then((res) => {
      setFaqs(res.data.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>FAQ</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {isLoading ? <p>लोड हुँदैछ...</p> : faqs.length === 0 ? <p>कुनै प्रश्न उपलब्ध छैन।</p> : (
          <div className="accordion-box">
            {faqs.map((faq) => (
              <div key={faq.id} className="accordion block" style={{ border: '1px solid #eee', borderRadius: 6, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  style={{ width: '100%', textAlign: 'left', padding: 14, background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {faq.question_np}
                </button>
                {openId === faq.id && (
                  <div style={{ padding: '0 14px 14px' }}>{faq.answer_np}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

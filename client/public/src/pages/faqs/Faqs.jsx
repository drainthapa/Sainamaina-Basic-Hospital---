import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/client';

const SIDEBAR_LINKS = [
    { type: 'notice', label: 'सूचना' },
    { type: 'press_release', label: 'प्रेस विज्ञप्ति' },
    { type: 'tender_notice', label: 'बोलपत्र सूचना' },
    { type: 'news', label: 'समाचार' },
    { type: 'event', label: 'कार्यक्रम तथा गतिविधि' },
];

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
                <section className="contact-info-section">
                    <div className="row clearfix">
                        <div className="col-md-3 col-xs-12">
                            <div className="notice-group-block">
                                <ul>
                                    {SIDEBAR_LINKS.map((link) => (
                                        <li key={link.type}>
                                            <Link to={`/news/${link.type}`}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-9 col-xs-12">
                            <section className="faq-container">
                                {isLoading ? <p>लोड हुँदैछ...</p> : faqs.length === 0 ? <p>कुनै प्रश्न उपलब्ध छैन।</p> : (
                                    <div className="accordion-box">
                                        {faqs.map((faq) => (
                                            <div key={faq.id} className="faq-box">
                                                <h1
                                                    className="faq-page"
                                                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {faq.question_np}
                                                </h1>
                                                {openId === faq.id && <p>{faq.answer_np}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

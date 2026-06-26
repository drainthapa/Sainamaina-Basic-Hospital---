import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fileUrl } from '../api/client';
import { adToBs } from '../hooks/useBsDate';

const TABS = [
    { key: 'notice', label: 'सूचना' },
    { key: 'health_article', label: 'सूचनाको हक' },
    { key: 'news', label: 'समाचार' },
    { key: 'event', label: 'गतिविधी' },
];

export default function HomeNewsTabs({ itemsByType }) {
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const items = itemsByType[activeTab] || [];

    return (
        <div className="home-news-tab-box">
            <div className="tab-wrapper">
                <ul className="nav nav-tabs tab-menu-1 nav-tab-menu-1" role="tablist">
                    {TABS.map((tab) => (
                        <li key={tab.key} className={`nav-item ${activeTab === tab.key ? 'active' : ''}`} role="presentation">
                            <a
                                className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
                                role="tab"
                            >
                                {tab.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="tab-content">
                <div className="tab-pane home-news-tab-row active in" role="tabpanel">
                    {items.length === 0 ? (
                        <div className="row"><div className="col-md-12 news-tab-row">छिट्टै आउंदै छ!</div></div>
                    ) : (
                        items.map((item) => (
                            <div className="row" key={item.id}>
                                <div className="col-md-12 news-tab-row">
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <Link
                                                className="tab-content-link"
                                                to={item.file_url ? fileUrl(item.file_url) : `/news/${activeTab}/${item.slug}`}
                                                target={item.file_url ? '_blank' : undefined}
                                            >
                                                <h3 className="main-tab-title">{item.title_np}</h3>
                                                <p className="published-date">
                                                    <small>प्रकाशित मिति :{item.bs_date || adToBs(item.ad_date)}</small>
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/navItems';

export default function SiteMap() {
  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>साइट म्याप</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>साइट म्याप</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        <div className="row">
          <div className="col-md-3">
            <h4><Link to="/">गृह पृष्ठ</Link></h4>
          </div>
          {NAV_ITEMS.filter((item) => item.children || item.to).map((item) => (
            <div className="col-md-3" key={item.label || item.to} style={{ marginBottom: 20 }}>
              {item.children ? (
                <>
                  <h4>{item.label}</h4>
                  <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {item.children.map((child) => (
                      <li key={child.to} style={{ marginBottom: 6 }}>
                        <Link to={child.to}>{child.label}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : item.type !== 'home' && (
                <h4><Link to={item.to}>{item.label}</Link></h4>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

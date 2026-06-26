import { Link } from 'react-router-dom';
import './Marquee.css';

export default function Marquee({ items }) {
  if (!items || items.length === 0) return null;
  // Rendered twice back-to-back so the -50% translateX loop has no visible seam.
  const doubled = [...items, ...items];

  return (
    <div className="latestNews">
      <div className="row">
        <div className="col-md-3">
          <div className="updateTitle">ताजा जानकारी :</div>
        </div>
        <div className="col-md-9 p-l-10">
          <div className="marquee-track-wrapper">
            <div className="marquee-track">
              {doubled.map((item, i) => (
                <Link key={`${item.id}-${i}`} to={`/news/notice/${item.slug}`} className="scrollNewsTitle">
                  {item.title_np}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

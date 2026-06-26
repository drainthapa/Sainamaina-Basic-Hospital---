import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentApi } from '../../api/client';

// Slugs match the seeded /content/pages slugs from the backend.
const SLUG_MAP = {
  organization: 'organization-structure',
};

export default function StaticPage() {
  const { pageKey } = useParams();
  const slug = SLUG_MAP[pageKey] || pageKey;
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    contentApi.getPage(slug).then((res) => setPage(res.data.data)).finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) return <div className="auto-container" style={{ padding: '40px 0' }}>लोड हुँदैछ...</div>;
  if (!page) return <div className="auto-container" style={{ padding: '40px 0' }}>पृष्ठ फेला परेन।</div>;

  return (
    <>
      <div className="auto-container page-title">
        <div className="row">
          <div className="title-box">
            <h1>{page.title_np}</h1>
            <ul className="bread-crumb clearfix">
              <li><Link to="/">गृह पृष्ठ</Link></li>
              <li>हाम्रो बारेमा</li>
              <li>{page.title_np}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auto-container" style={{ padding: '30px 0' }}>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: page.content_np || page.content_en || '<p>सामग्री छिट्टै थपिनेछ।</p>' }} />
      </div>
    </>
  );
}

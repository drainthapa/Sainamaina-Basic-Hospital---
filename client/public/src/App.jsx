import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Faqs from './pages/Faqs';
import SiteMap from './pages/SiteMap';
import StaticPage from './pages/about/StaticPage';
import DepartmentListPage from './pages/departments/DepartmentListPage';
import DepartmentDetailPage from './pages/departments/DepartmentDetailPage';
import ServiceListPage from './pages/services/ServiceListPage';
import StaffListPage from './pages/staff/StaffListPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import NewsListPage from './pages/news/NewsListPage';
import NewsDetailPage from './pages/news/NewsDetailPage';
import DownloadListPage from './pages/downloads/DownloadListPage';
import GalleryListPage from './pages/gallery/GalleryListPage';
import GalleryAlbumPage from './pages/gallery/GalleryAlbumPage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />

          <Route path="about/:pageKey" element={<StaticPage />} />

          <Route path="departments" element={<DepartmentListPage />} />
          <Route path="departments/:slug" element={<DepartmentDetailPage />} />
          <Route path="services" element={<ServiceListPage />} />

          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/:id" element={<StaffDetailPage />} />

          <Route path="news/:type" element={<NewsListPage />} />
          <Route path="news/:type/:slug" element={<NewsDetailPage />} />

          <Route path="downloads/:type" element={<DownloadListPage />} />

          <Route path="gallery/:type" element={<GalleryListPage />} />
          <Route path="gallery/:type/:id" element={<GalleryAlbumPage />} />

          <Route path="contact" element={<Contact />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="sitemap" element={<SiteMap />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

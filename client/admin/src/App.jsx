import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import RequireAuth from './components/RequireAuth';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import DepartmentList from './pages/departments/DepartmentList';
import DepartmentForm from './pages/departments/DepartmentForm';
import ServiceList from './pages/services/ServiceList';
import ServiceForm from './pages/services/ServiceForm';
import StaffList from './pages/staff/StaffList';
import StaffForm from './pages/staff/StaffForm';
import NewsList from './pages/news/NewsList';
import NewsForm from './pages/news/NewsForm';
import DownloadList from './pages/downloads/DownloadList';
import DownloadForm from './pages/downloads/DownloadForm';
import GalleryList from './pages/gallery/GalleryList';
import GalleryForm from './pages/gallery/GalleryForm';
import PageList from './pages/pages/PageList';
import PageEditor from './pages/pages/PageEditor';
import FaqList from './pages/faqs/FaqList';
import SettingsPage from './pages/settings/SettingsPage';
import UserList from './pages/users/UserList';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={(
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            )}
          >
            <Route index element={<Dashboard />} />

            <Route path="departments" element={<DepartmentList />} />
            <Route path="departments/:id" element={<DepartmentForm />} />

            <Route path="services" element={<ServiceList />} />
            <Route path="services/:id" element={<ServiceForm />} />

            <Route path="staff" element={<StaffList />} />
            <Route path="staff/:id" element={<StaffForm />} />

            <Route path="news" element={<NewsList />} />
            <Route path="news/:id" element={<NewsForm />} />

            <Route path="downloads" element={<DownloadList />} />
            <Route path="downloads/:id" element={<DownloadForm />} />

            <Route path="gallery" element={<GalleryList />} />
            <Route path="gallery/:id" element={<GalleryForm />} />

            <Route path="pages" element={<PageList />} />
            <Route path="pages/:slug" element={<PageEditor />} />

            <Route path="faqs" element={<FaqList />} />

            <Route
              path="settings"
              element={(
                <RequireAuth roles={['super_admin', 'hospital_administrator']}>
                  <SettingsPage />
                </RequireAuth>
              )}
            />

            <Route
              path="users"
              element={(
                <RequireAuth roles={['super_admin']}>
                  <UserList />
                </RequireAuth>
              )}
            />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

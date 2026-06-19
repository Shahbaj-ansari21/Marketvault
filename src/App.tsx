import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { UploadPage } from './pages/UploadPage';
import { DesignDetailPage } from './pages/DesignDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyDesignsPage } from './pages/MyDesignsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/design/:id" element={<DesignDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/my-designs" element={<MyDesignsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

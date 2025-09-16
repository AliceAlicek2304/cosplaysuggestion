import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/HomePage';
import ProfilePage from './components/profile/ProfilePage';
import CosplayPage from './components/cosplay/CosplayPage';
import CosplayDetailPage from './components/cosplay/CosplayDetailPage';
import FestivalPage from './components/festival/FestivalPage';
import EmailVerifyPage from './components/auth/EmailVerifyPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  useEffect(() => {
    // Simple routing based on URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      // Extract page name (before ? if exists)
      const pageName = hash.includes('?') ? hash.split('?')[0] : hash;
      setCurrentPage(pageName || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />;
      case 'cosplay':
        return <CosplayPage />;
      case 'festival':
        return <FestivalPage />;
      case 'verify-email':
        return <EmailVerifyPage />;
      default:
        // Check if it's a cosplay detail page (cosplay/{id})
        if (currentPage.startsWith('cosplay/')) {
          const folderId = currentPage.split('/')[1];
          return <CosplayDetailPage folderId={folderId} />;
        }
        return <HomePage />;
    }
  };

  // EmailVerifyPage không cần Header và Footer
  const isVerifyEmailPage = currentPage === 'verify-email';

  if (isVerifyEmailPage) {
    return (
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <EmailVerifyPage />
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="App d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

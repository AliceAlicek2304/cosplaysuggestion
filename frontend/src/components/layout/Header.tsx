import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { getAvatarUrl, getUserDisplayName } from '../../utils/helpers';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ForgotPasswordModal from '../auth/ForgotPasswordModal';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const handleForgotPasswordClick = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
  };
  
  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowForgotPasswordModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowForgotPasswordModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowRegisterModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  // Scroll to search section
  const scrollToSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if we're currently on the home page
    const currentHash = window.location.hash.slice(1);
    const currentPage = currentHash.includes('?') ? currentHash.split('?')[0] : currentHash;
    
    if (currentPage === '' || currentPage === 'home') {
      // We're on home page, just scroll to search section
      const searchSection = document.querySelector('[class*="searchSection"]');
      if (searchSection) {
        searchSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    } else {
      // We're on another page, navigate to home first then scroll
      window.location.hash = '#';
      // After navigation, scroll to search section
      setTimeout(() => {
        const searchSection = document.querySelector('[class*="searchSection"]');
        if (searchSection) {
          searchSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  return (
    <>
      <Navbar className={styles.navbar} variant="dark" expand="lg" sticky="top">
        <Container className={styles.navbarContent}>
          <Navbar.Brand href="#" className={styles.brand}>
            <i className={`fas fa-mask ${styles.brandIcon}`}></i>
            <span className={styles.brandText}>CosplaySuggestion</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                href="#" 
                className={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
              >
                Trang chủ
              </Nav.Link>
              <Nav.Link 
                href="#search" 
                className={styles.navLink}
                onClick={scrollToSearch}
              >
                Tìm kiếm
              </Nav.Link>
              <Nav.Link href="#" className={styles.navLink}>Cosplay</Nav.Link>
            </Nav>
            
            <Nav>
              {isAuthenticated ? (
                <Dropdown align="end" className={styles.userDropdown}>
                  <Dropdown.Toggle 
                    className={styles.userToggle}
                    id="user-dropdown"
                  >
                    <img
                      src={getAvatarUrl(user?.avatar)}
                      alt="Avatar"
                      className={styles.userAvatar}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getAvatarUrl();
                      }}
                    />
                    <span className={`${styles.userName} d-none d-md-inline`}>
                      {getUserDisplayName(user)}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className={styles.dropdownMenu}>
                    <Dropdown.Item href="#profile" className={styles.dropdownItem}>
                      <i className="fas fa-user"></i>
                      Hồ sơ cá nhân
                    </Dropdown.Item>
                    <Dropdown.Item href="" className={styles.dropdownItem}>
                      <i className="fas fa-cog"></i>
                      Cài đặt
                    </Dropdown.Item>
                    <Dropdown.Divider className={styles.dropdownDivider} />
                    <Dropdown.Item onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                      <i className="fas fa-sign-out-alt"></i>
                      Đăng xuất
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div className={styles.authButtons}>
                  <Button 
                    className={`${styles.authButton} ${styles.loginButton}`}
                    onClick={handleLoginClick}
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    Đăng nhập
                  </Button>
                  <Button 
                    className={`${styles.authButton} ${styles.registerButton}`}
                    onClick={handleRegisterClick}
                  >
                    <i className="fas fa-user-plus"></i>
                    Đăng ký
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        onHide={handleCloseModals}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgotPassword={handleForgotPasswordClick}
      />

      {/* Register Modal */}
      <RegisterModal 
        show={showRegisterModal} 
        onHide={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        show={showForgotPasswordModal} 
        onHide={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default Header;

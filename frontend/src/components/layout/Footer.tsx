import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  // Generate floating particles for footer
  const generateFooterParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(
        <div
          key={i}
          className={styles.footerParticle}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <footer className={styles.footer}>
      {/* Floating Particles */}
      <div className={styles.footerParticles}>
        {generateFooterParticles()}
      </div>
      
      <Container className={styles.footerContent}>
        <Row>
          <Col md={4} className={styles.brandSection}>
            <h5 className={styles.brandTitle}>
              <i className={`fas fa-mask ${styles.brandIcon}`}></i>
              CosplaySuggestion
            </h5>
            <p className={styles.brandDescription}>
              Nền tảng hỗ trợ cộng đồng cosplayer tìm kiếm trang phục 
              và nhận gợi ý pose chụp ảnh từ AI.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com" className={`${styles.socialLink} ${styles.facebook}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className={`${styles.socialLink} ${styles.instagram}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" className={`${styles.socialLink} ${styles.twitter}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://discord.com" className={`${styles.socialLink} ${styles.discord}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </Col>
          
          <Col md={2} className={styles.footerSection}>
            <h6 className={styles.sectionTitle}>Dịch vụ</h6>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="/search" className={styles.footerLink}>Tìm kiếm trang phục</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/suggestions" className={styles.footerLink}>Gợi ý pose</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/community" className={styles.footerLink}>Cộng đồng</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/blog" className={styles.footerLink}>Blog</a>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className={styles.footerSection}>
            <h6 className={styles.sectionTitle}>Hỗ trợ</h6>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="/help" className={styles.footerLink}>Trung tâm trợ giúp</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/contact" className={styles.footerLink}>Liên hệ</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/faq" className={styles.footerLink}>FAQ</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/feedback" className={styles.footerLink}>Góp ý</a>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className={styles.footerSection}>
            <h6 className={styles.sectionTitle}>Chính sách</h6>
            <ul className={styles.linkList}>
              <li className={styles.linkItem}>
                <a href="/privacy" className={styles.footerLink}>Bảo mật</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/terms" className={styles.footerLink}>Điều khoản</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/cookies" className={styles.footerLink}>Cookies</a>
              </li>
              <li className={styles.linkItem}>
                <a href="/guidelines" className={styles.footerLink}>Hướng dẫn</a>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className={styles.footerSection}>
            <h6 className={styles.sectionTitle}>Liên hệ</h6>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <i className={`fas fa-envelope ${styles.contactIcon}`}></i>
                support@cosplaysuggestion.com
              </div>
              <div className={styles.contactItem}>
                <i className={`fas fa-phone ${styles.contactIcon}`}></i>
                +84 123 456 789
              </div>
              <div className={styles.contactItem}>
                <i className={`fas fa-map-marker-alt ${styles.contactIcon}`}></i>
                Hà Nội, Việt Nam
              </div>
            </div>
          </Col>
        </Row>
        
        <hr className={styles.divider} />
        
        <div className={styles.bottomSection}>
          <Row className="align-items-center">
            <Col md={6}>
              <p className={styles.copyright}>
                © 2025 CosplaySuggestion. Tất cả quyền được bảo lưu.
              </p>
            </Col>
            <Col md={6}>
              <p className={styles.credits}>
                Được phát triển với <i className={`fas fa-heart ${styles.heartIcon}`}></i> bởi Alice
              </p>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

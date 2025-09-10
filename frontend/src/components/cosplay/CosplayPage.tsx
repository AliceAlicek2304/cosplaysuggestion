import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { galleryService } from '../../services/gallery.service';
import { getAvatarUrl, getBackgroundUrl, getGalleryItemUrl } from '../../utils/helpers';
import { GalleryItem } from '../../types/gallery.types';
import styles from './CosplayPage.module.css';

const CosplayPage: React.FC = () => {
  const [folders, setFolders] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState(1);

  useEffect(() => {
    fetchFolders();
  }, []);

  // Change background every 45 seconds (slower than homepage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => prev === 5 ? 1 : prev + 1);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      // Chỉ lấy folders active để hiển thị công khai
      const response = await galleryService.getAll();
      setFolders(response);
    } catch (err) {
      setError('Không thể tải danh sách cosplay');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: GalleryItem) => {
    // Chuyển tới trang detail với folder id
    window.location.hash = `#cosplay/${folder.id}`;
  };

  // Generate floating particles for cosplay page
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 30; i++) { // Fewer particles than homepage
      particles.push(
        <div
          key={i}
          className={styles.particle}
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

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className={styles.cosplayPage}>
      {/* Dynamic Background */}
      <div className={styles.backgroundContainer}>
        <img
          src={getBackgroundUrl(currentBg)}
          alt="Background"
          className={styles.backgroundImage}
        />
      </div>
      <div className={styles.backgroundOverlay} />
      
      {/* Floating Particles */}
      <div className={styles.particles}>
        {generateParticles()}
      </div>

      <Container className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <i className="fas fa-mask me-3"></i>
            Cosplay Gallery
          </h1>
          <p className={styles.subtitle}>
            Khám phá các bộ cosplay tuyệt đẹp từ cộng đồng
          </p>
        </div>

        <Row className={styles.grid}>
          {folders.map((folder) => (
            <Col key={folder.id} lg={3} md={4} sm={6} className="mb-4">
              <Card
                className={styles.folderCard}
                onClick={() => handleFolderClick(folder)}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={getGalleryItemUrl(folder.thumbnailUrl)}
                    alt={folder.displayName}
                    className={styles.thumbnail}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarUrl();
                    }}
                  />
                  <div className={styles.overlay}>
                    <i className="fas fa-eye"></i>
                  </div>
                </div>
                <Card.Body className={styles.cardBody}>
                  <Card.Title className={styles.folderTitle}>
                    {folder.displayName}
                  </Card.Title>
                  <div className={styles.folderMeta}>
                    <small className={styles.date}>
                      {new Date(folder.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {folders.length === 0 && (
          <div className={styles.emptyState}>
            <i className="fas fa-images fa-3x text-muted mb-3"></i>
            <h4>Chưa có bộ cosplay nào</h4>
            <p className="text-muted">Hãy quay lại sau khi có thêm nội dung mới!</p>
          </div>
        )}
      </Container>
    </div>
  );
};

export default CosplayPage;

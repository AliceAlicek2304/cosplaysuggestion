import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import { galleryService } from '../../services/gallery.service';
import { getAvatarUrl, getBackgroundUrl, getGalleryItemUrl } from '../../utils/helpers';
import { GalleryItem } from '../../types/gallery.types';
import styles from './CosplayDetailPage.module.css';

interface GalleryItemDetail {
  id: number;
  fileName: string;
  fileUrl: string;
  itemType: 'IMAGE' | 'VIDEO';
  isActive: boolean;
  createdAt: string;
}

const CosplayDetailPage: React.FC<{ folderId: string }> = ({ folderId }) => {
  const [folder, setFolder] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItemDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [currentBg, setCurrentBg] = useState(1);

  useEffect(() => {
    fetchFolderDetail();
  }, [folderId]);

  // Change background every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => prev === 5 ? 1 : prev + 1);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const fetchFolderDetail = async () => {
    try {
      setLoading(true);

      // Lấy thông tin folder
      const folders = await galleryService.getAll();
      const currentFolder = folders.find(f => f.id === parseInt(folderId));

      if (!currentFolder) {
        setError('Không tìm thấy bộ cosplay này');
        return;
      }

      setFolder(currentFolder);

      // Lấy items của folder
      const folderItems = await galleryService.getFolderItems(currentFolder.id);
      setItems(folderItems);

    } catch (err) {
      setError('Không thể tải chi tiết cosplay');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setZoomImage(getGalleryItemUrl(imageUrl));
  };

  const handleBack = () => {
    window.location.hash = '#cosplay';
  };

  // Generate floating particles for detail page
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

  if (error || !folder) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Không tìm thấy bộ cosplay'}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={handleBack}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className={styles.detailPage}>
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
        {/* Header */}
        <div className={styles.header}>
          <Button
            variant="outline-light"
            onClick={handleBack}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <h1 className={styles.title}>{folder.displayName}</h1>
          <div className={styles.meta}>
            <span className={styles.date}>
              <i className="fas fa-calendar me-1"></i>
              {new Date(folder.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <Row className={styles.gallery}>
          {items.filter(item => item.isActive).map((item) => (
            <Col key={item.id} lg={3} md={4} sm={6} className="mb-4">
              <div
                className={styles.imageCard}
                onClick={() => item.itemType === 'IMAGE' && handleImageClick(item.fileUrl)}
              >
                {item.itemType === 'IMAGE' ? (
                  <img
                    src={getGalleryItemUrl(item.fileUrl)}
                    alt={item.fileName}
                    className={styles.image}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarUrl();
                    }}
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <i className="fas fa-video fa-2x"></i>
                    <span>Video</span>
                  </div>
                )}
                <div className={styles.imageOverlay}>
                  <i className="fas fa-expand"></i>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {items.filter(item => item.isActive).length === 0 && (
          <div className={styles.emptyState}>
            <i className="fas fa-images fa-3x text-muted mb-3"></i>
            <h4>Chưa có hình ảnh nào</h4>
            <p className="text-muted">Bộ cosplay này chưa có nội dung</p>
          </div>
        )}
      </Container>

      {/* Modal phóng to ảnh */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            background: 'transparent',
          }}
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoom"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: 8,
              boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
              transition: 'transform 0.25s cubic-bezier(.4,2,.3,1)',
              transform: 'scale(1)',
              background: '#fff',
              padding: 8,
              animation: 'zoomIn 0.25s cubic-bezier(.4,2,.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            style={{
              position: 'absolute',
              top: 24,
              right: 32,
              background: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
            onClick={() => setZoomImage(null)}
          >Đóng</button>
          <style>{`
            @keyframes zoomIn {
              from { transform: scale(0.7); opacity: 0.5; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CosplayDetailPage;

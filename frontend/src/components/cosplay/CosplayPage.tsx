import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { galleryService } from '../../services/gallery.service';
import { initializeBackgroundImages, createBackgroundInterval } from '../../utils/background.utils';
import { getAvatarUrl, getBackgroundUrl, getGalleryItemUrl } from '../../utils/helpers';
import { GalleryItem } from '../../types/gallery.types';
import styles from './CosplayPage.module.css';

const CosplayPage: React.FC = () => {
  const [folders, setFolders] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBg, setCurrentBg] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Initialize available background images
    initializeBackgroundImages().then(() => {
      fetchFolders();
      // Rotate background images using shared utility
      const cleanup = createBackgroundInterval('cosplay', setCurrentBg);
      return cleanup;
    });
  }, []);

  const fetchFolders = async (query = '') => {
    try {
      setLoading(true);
      let response;
      if (query.trim()) {
        response = await galleryService.search(query);
      } else {
        // API đã trả về chỉ folders active
        response = await galleryService.getAllSorted();
      }
      setFolders(response);
    } catch (err) {
      setError('Không thể tải danh sách cosplay');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      await fetchFolders(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
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
      <div className={styles.cosplayPage}>
        {/* Dynamic Background - always render like FestivalPage */}
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

        {/* Loading Content */}
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cosplayPage}>
        {/* Dynamic Background - always render like FestivalPage */}
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

        {/* Error Content */}
        <Container className="mt-5">
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.cosplayPage}>
      {/* Dynamic Background - like FestivalPage */}
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
          
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className="d-flex">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tên cosplay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleClearSearch}
                    title="Xóa tìm kiếm"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  title="Tìm kiếm"
                >
                  {isSearching ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    <i className="fas fa-search"></i>
                  )}
                  <span className="d-none d-sm-inline ms-1">
                    {isSearching ? 'Đang tìm...' : 'Tìm'}
                  </span>
                </button>
                {searchQuery && (
                  <button
                    className="btn btn-outline-info"
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      fetchFolders();
                    }}
                    title="Hiển thị tất cả"
                  >
                    <i className="fas fa-list"></i>
                    <span className="d-none d-sm-inline ms-1">Tất cả</span>
                  </button>
                )}
              </div>
            </form>
          </div>
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
            {searchQuery ? (
              <>
                <h4>Không tìm thấy kết quả</h4>
                <p className="text-muted">
                  Không có bộ cosplay nào phù hợp với từ khóa "{searchQuery}"
                </p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => {
                    setSearchQuery('');
                    fetchFolders();
                  }}
                >
                  <i className="fas fa-list me-2"></i>
                  Hiển thị tất cả
                </button>
              </>
            ) : (
              <>
                <h4>Chưa có bộ cosplay nào</h4>
                <p className="text-muted">Hãy quay lại sau khi có thêm nội dung mới!</p>
              </>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default CosplayPage;

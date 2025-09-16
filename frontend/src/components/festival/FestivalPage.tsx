import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { festivalService } from '../../services/festival.service';
import { Festival, CreateNotificationRequest, NotificationFes } from '../../types/festival.types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toast.utils';
import { getBackgroundUrl } from '../../utils/helpers';
import styles from './FestivalPage.module.css';

const FestivalPage: React.FC = () => {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationNote, setNotificationNote] = useState('');
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [currentBg, setCurrentBg] = useState(1);
  const [userNotifications, setUserNotifications] = useState<NotificationFes[]>([]);

  // Background images for festival page
  const backgroundImages = [1, 2, 3, 4, 5]; // Images 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg

  useEffect(() => {
    fetchFestivals();
    if (user) {
      fetchUserNotifications();
    }
    // Rotate background images
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev % 5) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const data = await festivalService.getActiveFestivals();
      setFestivals(data);
    } catch (error) {
      setError('Không thể tải danh sách lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotifications = async () => {
    if (!user) return;
    
    try {
      const data = await festivalService.getMyNotifications();
      setUserNotifications(data);
    } catch (error) {
      // Silent fail - không hiển thị lỗi khi không lấy được notifications
      console.warn('Could not fetch user notifications:', error);
    }
  };

  const isFestivalRegistered = (festivalId: number): boolean => {
    return userNotifications.some(notification => notification.festival?.id === festivalId);
  };

  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
      };
      particles.push(
        <div
          key={i}
          className={styles.particle}
          style={style}
        />
      );
    }
    return particles;
  };

  const handleCreateNotification = async (festival: Festival) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng ký thông báo');
      return;
    }

    setSelectedFestival(festival);
    setShowNotificationModal(true);
  };

  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFestival) return;

    setNotificationLoading(true);
    try {
      const request: CreateNotificationRequest = {
        note: notificationNote.trim() || undefined
      };

      await festivalService.createNotification(selectedFestival.id, request);
      toast.success('Đăng ký thông báo thành công!');
      setShowNotificationModal(false);
      setNotificationNote('');
      setSelectedFestival(null);
      // Refresh user notifications after successful registration
      fetchUserNotifications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('Notification already exists')) {
        toast.warning('Bạn đã đăng ký thông báo cho lễ hội này rồi. Vui lòng kiểm tra trong phần Thông báo của bạn.');
      } else {
        toast.error(errorMessage || 'Lỗi đăng ký thông báo');
      }
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationNote('');
    setSelectedFestival(null);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  if (loading) {
    return (
      <div className={styles.festivalPage}>
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
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-white">Đang tải danh sách lễ hội...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.festivalPage}>
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
            <i className="fas fa-calendar-alt me-3"></i>
            Lễ Hội Cosplay
          </h1>
          <p className={styles.subtitle}>
            Khám phá các lễ hội cosplay hấp dẫn và đăng ký nhận thông báo
          </p>
          <div className="alert alert-info mt-3" style={{maxWidth: '600px', margin: '0 auto'}}>
            <i className="fas fa-info-circle me-2"></i>
            <strong>Thông báo:</strong> Chỉ những tài khoản đã xác thực email mới nhận được thông báo tự động trước 2 ngày khi lễ hội diễn ra.
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row className={styles.grid}>
          {festivals.map((festival) => (
            <Col lg={4} md={6} key={festival.id} className="mb-4">
              <Card className={`${styles.festivalCard} h-100`}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className={styles.festivalName}>{festival.name}</h5>
                    <Badge
                      bg={isUpcoming(festival.startDate) ? 'success' : 'secondary'}
                      className={styles.statusBadge}
                    >
                      {isUpcoming(festival.startDate) ? 'Sắp diễn ra' : 'Đã kết thúc'}
                    </Badge>
                  </div>

                  {festival.description && (
                    <p className={styles.festivalDescription}>{festival.description}</p>
                  )}

                  <div className={styles.festivalInfo}>
                    {festival.location && (
                      <div className="mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                        {festival.location}
                      </div>
                    )}

                    <div className="mb-2">
                      <i className="fas fa-calendar me-2 text-muted"></i>
                      <div>
                        <small className="d-block">Bắt đầu: {formatDateTime(festival.startDate)}</small>
                        <small className="d-block">Kết thúc: {formatDateTime(festival.endDate)}</small>
                      </div>
                    </div>

                    {festival.link && (
                      <div className="mb-3">
                        <i className="fas fa-external-link-alt me-2 text-muted"></i>
                        <a
                          href={festival.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.festivalLink}
                        >
                          Trang chủ sự kiện
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isUpcoming(festival.startDate) && user && !isFestivalRegistered(festival.id) && (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => handleCreateNotification(festival)}
                      >
                        <i className="fas fa-bell me-2"></i>
                        Đăng ký thông báo
                      </Button>
                    )}

                    {isUpcoming(festival.startDate) && user && isFestivalRegistered(festival.id) && (
                      <Button variant="success" className="w-100" disabled>
                        <i className="fas fa-check me-2"></i>
                        Đã đăng ký thông báo
                      </Button>
                    )}

                    {isUpcoming(festival.startDate) && !user && (
                      <Button variant="outline-primary" className="w-100" disabled>
                        <i className="fas fa-bell me-2"></i>
                        Đăng nhập để đăng ký
                      </Button>
                    )}

                    {!isUpcoming(festival.startDate) && (
                      <Button variant="secondary" className="w-100" disabled>
                        <i className="fas fa-check me-2"></i>
                        Đã kết thúc
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {festivals.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <i className="fas fa-calendar-times fa-3x mb-3"></i>
            <h4>Không có lễ hội nào</h4>
            <p>Hiện tại chưa có lễ hội nào được tổ chức.</p>
          </div>
        )}

        {/* Notification Modal */}
        <Modal show={showNotificationModal} onHide={handleCloseNotificationModal}>
          <Modal.Header closeButton>
            <Modal.Title>Đăng ký thông báo</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitNotification}>
            <Modal.Body>
              {selectedFestival && (
                <div className="mb-3">
                  <h6>{selectedFestival.name}</h6>
                  <p className="text-muted mb-0">
                    Thời gian: {formatDateTime(selectedFestival.startDate)}
                  </p>
                </div>
              )}

              <Form.Group>
                <Form.Label>Ghi chú (tùy chọn)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notificationNote}
                  onChange={(e) => setNotificationNote(e.target.value)}
                  placeholder="Nhập ghi chú cá nhân..."
                />
                <Form.Text className="text-muted">
                  Bạn sẽ nhận thông báo trước 2 ngày khi lễ hội diễn ra.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseNotificationModal}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={notificationLoading}
              >
                {notificationLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default FestivalPage;

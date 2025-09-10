import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import styles from './HomePage.module.css';
import { AuthContext } from '../contexts/AuthContext';
import { cosplayService } from '../services/api.service';
import CosplaySuggestionModal from './cosplay/CosplaySuggestionModal';
import { getBackgroundUrl } from '../utils/helpers';

interface CosplaySuggestionRequest {
  characterName: string;
  budget?: number;
  height?: number;
  weight?: number;
  gender?: string;
  notes?: string;
}

const HomePage: React.FC = () => {
  const [currentBg, setCurrentBg] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [suggestion, setSuggestion] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const backgroundImages = [1, 2, 3, 4]; // Images 1.jpg, 2.jpg, 3.jpg, 4.jpg

  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;

  const [formData, setFormData] = useState<CosplaySuggestionRequest>(() => {
    // Try to restore from localStorage
    try {
      const savedFormData = localStorage.getItem('cosplaySearchFormData');
      if (savedFormData) {
        return JSON.parse(savedFormData);
      }
    } catch (error) {
      console.error('Error restoring form data from localStorage:', error);
    }
    
    return {
      characterName: '',
      budget: undefined,
      height: undefined,
      weight: undefined,
      gender: undefined,
      notes: ''
    };
  });

  // Change background every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => prev === 4 ? 1 : prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update form data when user context changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Only auto-fill if the field is empty and user has the data
        height: prev.height !== undefined ? prev.height : user.height || undefined,
        weight: prev.weight !== undefined ? prev.weight : user.weight || undefined,
        gender: prev.gender !== undefined && prev.gender !== '' ? prev.gender : user.gender || undefined,
      }));
    }
  }, [user]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('cosplaySearchFormData', JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [formData]);

  // Scroll to search section
  const scrollToSearch = () => {
    const searchSection = document.querySelector(`.${styles.searchSection}`);
    if (searchSection) {
      searchSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.characterName.trim()) return;

    setLoading(true);
    setError('');
    setSuggestion(null);

    try {
      // Validate required fields for guest users
      if (!isAuthenticated) {
        if (!formData.height || !formData.weight || !formData.gender) {
          setError('Chiều cao, cân nặng và giới tính là bắt buộc cho người dùng chưa đăng nhập');
          setLoading(false);
          return;
        }
      }

      const response = await cosplayService.generateSuggestion(formData);
      
      if (response.success) {
        setSuggestion(response.data);
        setShowModal(true);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tạo gợi ý');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'height' || name === 'weight' 
        ? (value === '' ? undefined : parseFloat(value))
        : value
    }));
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EASY': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HARD': return 'danger';
      default: return 'secondary';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return level;
    }
  };

  // Generate floating particles
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <div
          key={i}
          className={styles.particle}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className={styles.homePage}>
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

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  Khám phá thế giới Cosplay với CosplaySuggestion
                </h1>
                <p className={styles.heroSubtitle}>
                  Tìm kiếm trang phục cosplay hoàn hảo và nhận gợi ý pose chụp ảnh 
                  . Tham gia cộng đồng cosplayer lớn nhất Việt Nam!
                </p>
                <div className={styles.heroButtons}>
                  <Button 
                    className={`${styles.heroButton} ${styles.primaryButton}`}
                    onClick={scrollToSearch}
                  >
                    <i className="fas fa-search me-2"></i>
                    Tìm kiếm ngay
                  </Button>
                  <Button className={`${styles.heroButton} ${styles.secondaryButton}`}>
                    <i className="fas fa-play me-2"></i>
                    Xem demo
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className={styles.heroImageContainer}>
                <div className={styles.heroImage}>
                  <div className={styles.floatingCard}>
                    <Card className={styles.previewCard}>
                      
                    </Card>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search Section */}
      <section className={styles.searchSection}>
        <Container>
          <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>Tìm kiếm gợi ý cosplay</h2>
              <p className={styles.searchSubtitle}>
                Nhập tên nhân vật và thông tin của bạn để nhận gợi ý cosplay phù hợp nhất
              </p>
            </div>
            
            <Form onSubmit={handleSearch} className={styles.searchForm}>
              <Row className="g-3">
                <Col md={12}>
                  <InputGroup className={styles.mainSearchGroup}>
                    <Form.Control
                      type="text"
                      name="characterName"
                      placeholder="Nhập tên nhân vật (VD: Elaina, Nezuko, Miku...)"
                      value={formData.characterName}
                      onChange={handleInputChange}
                      className={styles.mainSearchInput}
                      required
                    />
                    <Button 
                      type="submit" 
                      className={styles.searchButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Đang tìm kiếm...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search me-2"></i>
                          Tìm kiếm
                        </>
                      )}
                    </Button>
                  </InputGroup>
                </Col>

                {/* Additional filters */}
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className={styles.formLabel}>Ngân sách (VND)</Form.Label>
                    <Form.Control
                      type="number"
                      name="budget"
                      placeholder="VD: 2000000"
                      value={formData.budget || ''}
                      onChange={handleInputChange}
                      className={styles.filterInput}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className={styles.formLabel}>
                      Chiều cao (cm) {!isAuthenticated && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="height"
                      placeholder="VD: 165"
                      value={formData.height || ''}
                      onChange={handleInputChange}
                      className={styles.filterInput}
                      required={!isAuthenticated}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className={styles.formLabel}>
                      Cân nặng (kg) {!isAuthenticated && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      placeholder="VD: 55"
                      value={formData.weight || ''}
                      onChange={handleInputChange}
                      className={styles.filterInput}
                      required={!isAuthenticated}
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className={styles.formLabel}>
                      Giới tính {!isAuthenticated && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className={styles.filterSelect}
                      required={!isAuthenticated}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className={styles.formLabel}>Ghi chú thêm (tùy chọn)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      placeholder="VD: Tôi thích màu xanh, không thích trang phục quá phức tạp..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      className={styles.notesInput}
                    />
                  </Form.Group>
                </Col>

                {error && (
                  <Col md={12}>
                    <Alert variant="danger" className={styles.errorAlert}>
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  </Col>
                )}

                <div className="mt-2">
                </div>
              </Row>
            </Form>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <Container>
          <div className={styles.featuresContainer}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.featuresTitle}>Tính năng nổi bật</h2>
              <p className={styles.featuresSubtitle}>
                Những tính năng độc đáo giúp bạn có trải nghiệm cosplay tuyệt vời nhất
              </p>
            </div>
            
            <Row className="g-4">
              <Col md={6} lg={4}>
                <Card className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <Card.Body>
                    <h5 className={styles.featureTitle}>Tìm kiếm sản phẩm</h5>
                    <p className={styles.featureDescription}>
                      Tự động tìm kiếm và so sánh giá cả các sản phẩm cosplay 
                      từ Taobao với giá tốt nhất.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} lg={4}>
                <Card className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <i className="fas fa-wallet"></i>
                  </div>
                  <Card.Body>
                    <h5 className={styles.featureTitle}>Phân tích ngân sách</h5>
                    <p className={styles.featureDescription}>
                      Tính toán chi tiết chi phí cosplay và đưa ra lời khuyên 
                      để tối ưu hóa ngân sách của bạn.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} lg={4}>
                <Card className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <i className="fas fa-star"></i>
                  </div>
                  <Card.Body>
                    <h5 className={styles.featureTitle}>Gợi ý pose</h5>
                    <p className={styles.featureDescription}>
                      Học cách tạo dáng và chụp ảnh cosplay đẹp với 
                      những gợi ý pose chuyên nghiệp.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* CosplaySuggestionModal */}
      <CosplaySuggestionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        data={suggestion}
      />

    </div>
  );
};

export default HomePage;

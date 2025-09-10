import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Tabs, Tab, Pagination } from 'react-bootstrap';
import { CosplayProduct } from '../../types/auth.types';
import styles from './CosplaySuggestionModal.module.css';

interface CosplaySuggestionData {
  characterName: string;
  characterDescription: string | null;
  difficultyLevel: string | null;
  suitabilityScore: string | null;
  budgetAnalysis: string | null;
  recommendations: string | null;
  itemsList: string | null;
  tips: string | null;
  alternatives: string | null;
  taobaoKeywords: string[] | null;
  processingTimeMs: string;
  products: CosplayProduct[] | null;
}

interface CosplaySuggestionModalProps {
  show: boolean;
  onHide: () => void;
  data: CosplaySuggestionData | null;
}

const CosplaySuggestionModal: React.FC<CosplaySuggestionModalProps> = ({
  show,
  onHide,
  data
}) => {
  const [activeTab, setActiveTab] = useState('suggestion');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  if (!data) return null;

  // Safe check for products array
  const products = data.products || [];

  // Pagination logic
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const getDifficultyColor = (level: string | null) => {
    if (!level) return 'secondary';
    
    switch (level.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatText = (text: string | null) => {
    if (!text) return <span className="text-muted">Không có thông tin</span>;
    
    return (
      <div className={styles.formattedText}>
        {text.split('\n').map((line, lineIndex) => {
          // Process **bold** text
          const processMarkdown = (text: string) => {
            // Split by **bold** patterns
            const parts = text.split(/(\*\*.*?\*\*)/g);
            
            return parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                // Bold text
                const boldText = part.slice(2, -2);
                return (
                  <strong key={`bold-${lineIndex}-${index}`} className="fw-bold text-primary">
                    {boldText}
                  </strong>
                );
              } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
                // Italic text
                const italicText = part.slice(1, -1);
                return (
                  <em key={`italic-${lineIndex}-${index}`} className="fst-italic">
                    {italicText}
                  </em>
                );
              } else {
                // Regular text
                return part;
              }
            });
          };

          // Check if line starts with bullet point
          const trimmedLine = line.trim();
          const isBulletPoint = trimmedLine.startsWith('* ') && !trimmedLine.startsWith('**');
          
          if (isBulletPoint) {
            // Remove the '* ' and process as bullet point
            const lineWithoutBullet = line.replace(/^\s*\*\s/, '');
            return (
              <div key={`bullet-${lineIndex}`} className={styles.bulletPoint}>
                <i className={`fas fa-circle ${styles.bulletIcon}`}></i>
                <span className={styles.bulletText}>{processMarkdown(lineWithoutBullet)}</span>
              </div>
            );
          } else {
            // Regular line
            return (
              <div key={`line-${lineIndex}`} className={lineIndex < text.split('\n').length - 1 ? 'mb-2' : ''}>
                {processMarkdown(line)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className={styles.modal}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <i className="fas fa-sparkles me-2"></i>
          Gợi ý Cosplay: {data.characterName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'suggestion')}
          className={styles.customTabs}
        >
          <Tab eventKey="suggestion" title="Chi tiết gợi ý">
            <div className={styles.tabContent}>
              {/* Character Info */}
              <Card className={styles.characterCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className="mb-0">
                    <i className="fas fa-user-circle me-2"></i>
                    Thông tin nhân vật
                  </h5>
                </Card.Header>
                <Card.Body className={styles.cardBody}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className={styles.characterName}>{data.characterName}</h6>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg={getDifficultyColor(data.difficultyLevel)}>
                          Độ khó: {data.difficultyLevel || 'Chưa đánh giá'}
                        </Badge>
                        <Badge bg="info">
                          Điểm phù hợp: {data.suitabilityScore || 'N/A'}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className={styles.description}>
                    {formatText(data.characterDescription)}
                  </div>
                </Card.Body>
              </Card>

              {/* Budget Analysis */}
              <Card className={styles.infoCard}>
                <Card.Header className={styles.cardHeader}>
                  <h5 className="mb-0">
                    <i className="fas fa-wallet me-2"></i>
                    Phân tích ngân sách
                  </h5>
                </Card.Header>
                <Card.Body className={styles.cardBody}>
                  <div className={styles.budgetText}>
                    {formatText(data.budgetAnalysis)}
                  </div>
                </Card.Body>
              </Card>

              <Row>
                <Col md={6}>
                  {/* Recommendations */}
                  <Card className={styles.infoCard}>
                    <Card.Header className={styles.cardHeader}>
                      <h5 className="mb-0">
                        <i className="fas fa-lightbulb me-2"></i>
                        Khuyến nghị chi tiết
                      </h5>
                    </Card.Header>
                    <Card.Body className={styles.cardBody}>
                      <div className={styles.recommendationText}>
                        {formatText(data.recommendations)}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  {/* Items List */}
                  <Card className={styles.infoCard}>
                    <Card.Header className={styles.cardHeader}>
                      <h5 className="mb-0">
                        <i className="fas fa-list-check me-2"></i>
                        Danh sách vật phẩm
                      </h5>
                    </Card.Header>
                    <Card.Body className={styles.cardBody}>
                      <div className={styles.itemsList}>
                        {formatText(data.itemsList)}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Tips */}
                  <Card className={styles.infoCard}>
                    <Card.Header className={styles.cardHeader}>
                      <h5 className="mb-0">
                        <i className="fas fa-star me-2"></i>
                        Mẹo hữu ích
                      </h5>
                    </Card.Header>
                    <Card.Body className={styles.cardBody}>
                      <div className={styles.tipsText}>
                        {formatText(data.tips)}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Alternatives */}
                  <Card className={styles.infoCard}>
                    <Card.Header className={styles.cardHeader}>
                      <h5 className="mb-0">
                        <i className="fas fa-exchange-alt me-2"></i>
                        Gợi ý thay thế
                      </h5>
                    </Card.Header>
                    <Card.Body className={styles.cardBody}>
                      <div className={styles.alternativesText}>
                        {formatText(data.alternatives)}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="products" title="Sản phẩm trang phục">
            <div className={styles.tabContent}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className={styles.productsTitle}>
                  <i className="fas fa-shopping-bag me-2"></i>
                  Sản phẩm trang phục ({products.length} sản phẩm)
                </h5>
                <div className={styles.pageInfo}>
                  Trang {currentPage} / {totalPages}
                </div>
              </div>

              <Row>
                {currentProducts.length === 0 ? (
                  <Col xs={12}>
                    <div className="text-center py-5">
                      <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Không tìm thấy sản phẩm</h5>
                      <p className="text-muted">Hãy thử tìm kiếm với nhân vật khác</p>
                    </div>
                  </Col>
                ) : (
                  currentProducts.map((product) => (
                    <Col md={4} key={product.id} className="mb-4">
                      <Card className={styles.productCard}>
                        <div className={styles.productImageContainer}>
                          <Card.Img 
                            variant="top" 
                            src={product.img_url} 
                            className={styles.productImage}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div className={styles.priceOverlay}>
                            <span className={styles.price}>
                              {formatPrice(product.priceVND)}
                            </span>
                          </div>
                        </div>
                        <Card.Body className={styles.productCardBody}>
                          <Card.Title className={styles.productTitle}>
                            {product.titleEn}
                          </Card.Title>
                          <div className={styles.sellerInfo}>
                            <i className="fas fa-store me-1"></i>
                            {product.seller_name}
                          </div>
                          <div className={styles.productActions}>
                            <Button
                              onClick={() => {
                                if (product.link) {
                                  window.open(product.link, '_blank', 'noopener,noreferrer');
                                } else {
                                  console.warn('Product link is missing');
                                }
                              }}
                              className={styles.viewProductBtn}
                              size="sm"
                              disabled={!product.link}
                            >
                              <i className="fas fa-external-link-alt me-1"></i>
                              Xem sản phẩm
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className={styles.pagination}>
                    <Pagination.First 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    />
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        <div className={styles.processingTime}>
          <i className="fas fa-clock me-1"></i>
          Thời gian xử lý: {data.processingTimeMs}ms
        </div>
        <Button variant="secondary" onClick={onHide} className={styles.closeBtn}>
          <i className="fas fa-times me-1"></i>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CosplaySuggestionModal;

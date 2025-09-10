            import React, { useEffect, useState } from 'react';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import styles from './EmailVerifyPage.module.css';

interface VerifyStatus {
  status: 'loading' | 'success' | 'error';
  message: string;
}

const EmailVerifyPage: React.FC = () => {
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>({
    status: 'loading',
    message: 'Đang xác thực email của bạn...'
  });

  useEffect(() => {
    // Lấy parameters từ URL hash (sau dấu ?)
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryString);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    
    if (status && message) {
      // Nếu có status và message từ redirect của backend
      setVerifyStatus({
        status: status as 'success' | 'error',
        message: decodeURIComponent(message)
      });
    } else {
      // Fallback: Nếu không có params, hiển thị lỗi
      setVerifyStatus({
        status: 'error',
        message: 'Liên kết xác thực không hợp lệ hoặc đã hết hạn!'
      });
    }
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoLogin = () => {
    window.location.href = '/#login';
  };

  return (
    <div className={styles.verifyPage}>
      {/* Background với hiệu ứng giống HomePage */}
      <div className={styles.backgroundContainer}>
        <div className={styles.backgroundOverlay}></div>
      </div>

      <Container className={styles.contentContainer}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card className={`${styles.verifyCard} shadow-lg`}>
              <Card.Header className={`${styles.cardHeader} text-center`}>
                <h3 className="mb-0">
                  <i className="fas fa-envelope-check me-2"></i>
                  Xác Thực Email
                </h3>
              </Card.Header>
              
              <Card.Body className={`${styles.cardBody} p-5`}>
                {verifyStatus.status === 'loading' && (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" className="mb-4" style={{ width: '3rem', height: '3rem' }} />
                    <h5 className="mb-3">Đang xử lý...</h5>
                    <p className="text-muted">{verifyStatus.message}</p>
                  </div>
                )}

                {verifyStatus.status === 'success' && (
                  <div className="text-center">
                    <div className={`${styles.successIcon} mb-4`}>
                      <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <Alert variant="success" className={`${styles.alert} mb-4`}>
                      <Alert.Heading className="h4">🎉 Xác thực thành công!</Alert.Heading>
                      <p className="mb-0">{verifyStatus.message}</p>
                    </Alert>
                    <p className="text-muted mb-4">
                      Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ!
                    </p>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button 
                        variant="primary" 
                        size="lg"
                        className={`${styles.primaryBtn} me-md-2`}
                        onClick={handleGoLogin}
                      >
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Đăng Nhập Ngay
                      </Button>
                      <Button 
                        variant="outline-secondary"
                        size="lg"
                        className={styles.secondaryBtn}
                        onClick={handleGoHome}
                      >
                        <i className="fas fa-home me-2"></i>
                        Về Trang Chủ
                      </Button>
                    </div>
                  </div>
                )}

                {verifyStatus.status === 'error' && (
                  <div className="text-center">
                    <div className={`${styles.errorIcon} mb-4`}>
                      <i className="fas fa-times-circle text-danger" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <Alert variant="danger" className={`${styles.alert} mb-4`}>
                      <Alert.Heading className="h4">❌ Xác thực thất bại!</Alert.Heading>
                      <p className="mb-0">{verifyStatus.message}</p>
                    </Alert>
                    <p className="text-muted mb-4">
                      Vui lòng kiểm tra lại liên kết xác thực hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                    </p>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button 
                        variant="primary"
                        size="lg"
                        className={`${styles.primaryBtn} me-md-2`}
                        onClick={handleGoHome}
                      >
                        <i className="fas fa-home me-2"></i>
                        Về Trang Chủ
                      </Button>
                      <Button 
                        variant="outline-info"
                        size="lg"
                        className={styles.secondaryBtn}
                        onClick={() => window.location.href = '/#contact'}
                      >
                        <i className="fas fa-question-circle me-2"></i>
                        Liên Hệ Hỗ Trợ
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EmailVerifyPage;

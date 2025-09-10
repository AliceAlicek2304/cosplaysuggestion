import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { authService } from '../../services/api.service';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../../types/auth.types';
import { translateErrorMessage } from '../../utils/helpers';
import { toast } from '../../utils/toast.utils';
import styles from './AuthModal.module.css';

interface ForgotPasswordModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
  show, 
  onHide, 
  onSwitchToLogin 
}) => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [forgotFormData, setForgotFormData] = useState<ForgotPasswordRequest>({
    usernameOrEmail: '',
  });

  const [resetFormData, setResetFormData] = useState<ResetPasswordRequest>({
    usernameOrEmail: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (step === 'email') {
      setForgotFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setResetFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(forgotFormData);
      setEmailSent(true);
      setSuccess('Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      
      // Show success toast
      toast.info('📧 Mã xác nhận đã được gửi đến email của bạn!', 4000);
      
      setResetFormData(prev => ({
        ...prev,
        usernameOrEmail: forgotFormData.usernameOrEmail
      }));
      setStep('reset');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setError(translateErrorMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (resetFormData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(resetFormData);
      
      // Show success toast
      toast.success('Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới.', 4000);
      
      // Close modal and switch to login
      handleClose();
      setTimeout(() => {
        onSwitchToLogin();
      }, 500);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setError(translateErrorMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onHide();
    setStep('email');
    setForgotFormData({ usernameOrEmail: '' });
    setResetFormData({
      usernameOrEmail: '',
      resetCode: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setEmailSent(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError('');
    setSuccess('');
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      size="lg"
      className={styles.modal}
      backdropClassName={styles.modalBackdrop}
      dialogClassName={styles.modalDialog}
    >
      <div className={styles.modalContent}>
        <Modal.Header className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <i className={`fas ${step === 'email' ? 'fa-key' : 'fa-lock'} ${styles.modalIcon}`}></i>
            {step === 'email' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
          </Modal.Title>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </Modal.Header>
        
        <Modal.Body className={styles.modalBody}>
          {error && (
            <Alert className={styles.alertError}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert className={styles.alertSuccess}>
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </Alert>
          )}

          {step === 'email' ? (
            <Form onSubmit={handleForgotPasswordSubmit}>
              <div className={styles.formDescription}>
                <p>Nhập email hoặc tên đăng nhập của bạn. Chúng tôi sẽ gửi mã xác nhận 6 chữ số đến email của bạn.</p>
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-envelope ${styles.labelIcon}`}></i>
                  Email hoặc Tên đăng nhập
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="text"
                  name="usernameOrEmail"
                  value={forgotFormData.usernameOrEmail}
                  onChange={handleInputChange}
                  placeholder="Nhập email hoặc tên đăng nhập"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleResetPasswordSubmit}>
              <div className={styles.formDescription}>
                <p>Nhập mã xác nhận 6 chữ số đã được gửi đến email của bạn và mật khẩu mới.</p>
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-shield-alt ${styles.labelIcon}`}></i>
                  Mã xác nhận (6 chữ số)
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="text"
                  name="resetCode"
                  value={resetFormData.resetCode}
                  onChange={handleInputChange}
                  placeholder="Nhập mã 6 chữ số"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-lock ${styles.labelIcon}`}></i>
                  Mật khẩu mới
                </Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    className={styles.formControl}
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={resetFormData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-lock ${styles.labelIcon}`}></i>
                  Xác nhận mật khẩu mới
                </Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    className={styles.formControl}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={resetFormData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </Button>

              <div className={styles.switchText}>
                <button
                  type="button"
                  className={styles.switchLink}
                  onClick={handleBackToEmail}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Quay lại nhập email
                </button>
              </div>
            </Form>
          )}

          <div className={styles.divider}>hoặc</div>

          <div className={styles.switchText}>
            Nhớ mật khẩu?
            <button
              type="button"
              className={styles.switchLink}
              onClick={onSwitchToLogin}
            >
              Đăng nhập ngay
            </button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;

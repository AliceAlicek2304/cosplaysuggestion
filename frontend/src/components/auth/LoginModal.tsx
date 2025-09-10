import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/auth.types';
import { translateErrorMessage } from '../../utils/helpers';
import { toast } from '../../utils/toast.utils';
import styles from './AuthModal.module.css';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onHide, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      
      // Show success toast
      toast.success('Đăng nhập thành công! Chào mừng bạn trở lại 🎭');
      
      onHide();
      setFormData({ usernameOrEmail: '', password: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      setError(translateErrorMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onHide();
    setFormData({ usernameOrEmail: '', password: '' });
    setError('');
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
              <i className={`fas fa-sign-in-alt ${styles.modalIcon}`}></i>
              Đăng nhập
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
            
            <Form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-user ${styles.labelIcon}`}></i>
                  Email hoặc Tên đăng nhập
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="text"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleInputChange}
                  placeholder="Nhập email hoặc tên đăng nhập"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-lock ${styles.labelIcon}`}></i>
                  Mật khẩu
                </Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    className={styles.formControl}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
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

              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="remember"
                  className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  className={styles.forgotPasswordLink}
                  onClick={onSwitchToForgotPassword}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className={styles.submitButton}
              >
                {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form>

            <div className={styles.divider}>hoặc</div>

            <div className={styles.switchText}>
              Chưa có tài khoản?
              <button
                type="button"
                className={styles.switchLink}
                onClick={onSwitchToRegister}
              >
                Đăng ký ngay
              </button>
            </div>
          </Modal.Body>
        </div>
    </Modal>
  );
};

export default LoginModal;

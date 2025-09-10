import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types/auth.types';
import { translateErrorMessage } from '../../utils/helpers';
import styles from './AuthModal.module.css';

interface RegisterModalProps {
  show: boolean;
  onHide: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ show, onHide, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    birthday: '',
    gender: 'MALE',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    setSuccess('');

    // Validate password confirmation
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      setFormData({
        username: '',
        fullName: '',
        email: '',
        password: '',
        birthday: '',
        gender: 'MALE',
      });
      setConfirmPassword('');
      
      // Auto switch to login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
        setSuccess('');
      }, 2000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      setError(translateErrorMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onHide();
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      birthday: '',
      gender: 'MALE',
    });
    setConfirmPassword('');
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
            <i className={`fas fa-user-plus ${styles.modalIcon}`}></i>
            Đăng ký tài khoản
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
          
          <Form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-user ${styles.labelIcon}`}></i>
                  Tên đăng nhập
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-id-card ${styles.labelIcon}`}></i>
                  Họ và tên
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <i className={`fas fa-envelope ${styles.labelIcon}`}></i>
                Email
              </Form.Label>
              <Form.Control
                className={styles.formControl}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>

            <div className={styles.formRow}>
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

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-check ${styles.labelIcon}`}></i>
                  Xác nhận mật khẩu
                </Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    className={styles.formControl}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
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
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-calendar ${styles.labelIcon}`}></i>
                  Ngày sinh
                </Form.Label>
                <Form.Control
                  className={styles.formControl}
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <i className={`fas fa-venus-mars ${styles.labelIcon}`}></i>
                  Giới tính
                </Form.Label>
                <Form.Select
                  className={styles.formControl}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </Form.Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className={styles.submitButton}
            >
              {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form>

          <div className={styles.divider}>hoặc</div>

          <div className={styles.switchText}>
            Đã có tài khoản?
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

export default RegisterModal;

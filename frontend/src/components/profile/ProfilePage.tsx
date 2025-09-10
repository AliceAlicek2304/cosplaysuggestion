import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Form, Button, Alert, Badge, Table, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api.service';
import { galleryService } from '../../services/gallery.service';
import { getAvatarUrl, getBackgroundUrl, getGalleryItemUrl } from '../../utils/helpers';
import { toast } from '../../utils/toast.utils';
import styles from './ProfilePage.module.css';
import { GalleryItem } from '../../types/gallery.types';


interface UpdateProfileData {
  fullName: string;
  email: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  height: string;
  weight: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangeEmailData {
  newEmail: string;
  password: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBg, setCurrentBg] = useState(1);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Change background every 45 seconds (slower than homepage)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg(prev => prev === 5 ? 1 : prev + 1);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Profile update state
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    fullName: '',
    email: '',
    birthday: '',
    gender: '',
    height: '',
    weight: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email change state
  const [emailData, setEmailData] = useState<ChangeEmailData>({
    newEmail: '',
    password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [editFolderModal, setEditFolderModal] = useState<{ open: boolean; folder: GalleryItem | null }>({ open: false, folder: null });
  const [folderItems, setFolderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState(false);
  const [addItemFile, setAddItemFile] = useState<File | null>(null);
  const [addItemType, setAddItemType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [addItemError, setAddItemError] = useState('');
  // Lấy danh sách item của folder
  const fetchFolderItems = async (folderId: number) => {
    setLoadingItems(true);
    try {
      const response = await galleryService.getFolderItems(folderId);
      setFolderItems(response);
    } catch {
      setFolderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Xử lý mở modal chỉnh sửa folder
  const handleOpenEditFolder = (folder: GalleryItem) => {
    setEditFolderModal({ open: true, folder });
    fetchFolderItems(folder.id);
  };

  // Đóng modal chỉnh sửa folder
  const handleCloseEditFolder = () => {
    setEditFolderModal({ open: false, folder: null });
    setFolderItems([]);
    setAddItemFile(null);
    setAddItemError('');
  };

  // Xoá item
  const handleDeleteItem = async (itemId: number) => {
    setItemActionLoading(true);
    try {
      await galleryService.deleteItem(itemId);
      if (editFolderModal.folder) fetchFolderItems(editFolderModal.folder.id);
    } catch {}
    setItemActionLoading(false);
  };

  // Đổi trạng thái item
  const handleSetItemActiveStatus = async (itemId: number, active: boolean) => {
    setItemActionLoading(true);
    try {
      await galleryService.setItemActiveStatus(itemId, active);
      if (editFolderModal.folder) fetchFolderItems(editFolderModal.folder.id);
    } catch {}
    setItemActionLoading(false);
  };

  // Thêm item mới
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItemFile || !editFolderModal.folder) {
      setAddItemError('Vui lòng chọn file');
      return;
    }
    setItemActionLoading(true);
    setAddItemError('');
    try {
      await galleryService.addItemToFolder(editFolderModal.folder.id, addItemFile, addItemType);
      setAddItemFile(null);
      if (editFolderModal.folder) fetchFolderItems(editFolderModal.folder.id);
    } catch {
      setAddItemError('Lỗi khi thêm item');
    }
    setItemActionLoading(false);
  };
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [gallerySuccess, setGallerySuccess] = useState('');
  const [galleryName, setGalleryName] = useState('');
  const [galleryZipFile, setGalleryZipFile] = useState<File | null>(null);
  const [galleryThumbnail, setGalleryThumbnail] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        birthday: (user as any).birthDay || '',
        gender: user.gender || '',
        height: user.height ? user.height.toString() : '',
        weight: user.weight ? user.weight.toString() : ''
      });
    }
    // Luôn lấy tất cả folder (cả active/inactive)
    if (user?.role === 'ADMIN') fetchGalleryAll();
  }, [user]);

  // Hàm lấy tất cả folder (cả active/inactive)
  const fetchGalleryAll = async () => {
    try {
      // Gọi API /api/gallery (trả về tất cả folder)
      const response = await galleryService.getAllFoldersRaw?.();
      setGallery(response ?? []);
    } catch {
      setGalleryError('Không thể tải danh sách gallery');
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        fullName: profileData.fullName,
        birthday: profileData.birthday || null,
        gender: profileData.gender ? profileData.gender as 'MALE' | 'FEMALE' | 'OTHER' : null,
        height: profileData.height ? parseFloat(profileData.height) : null,
        weight: profileData.weight ? parseFloat(profileData.weight) : null
      };

      await authService.updateProfile(updateData);
      
      // Update user context
      if (user) {
        updateUser({
          ...user,
          fullName: profileData.fullName,
          birthday: profileData.birthday,
          gender: profileData.gender ? profileData.gender as 'MALE' | 'FEMALE' | 'OTHER' : undefined,
          height: profileData.height ? parseFloat(profileData.height) : undefined,
          weight: profileData.weight ? parseFloat(profileData.weight) : undefined
        });
      }

      toast.success('Cập nhật thông tin thành công!');
      setSuccess('Thông tin đã được cập nhật thành công!');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      toast.success('Đổi mật khẩu thành công!');
      setSuccess('Mật khẩu đã được thay đổi thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (emailData.newEmail === user?.email) {
      setError('Email mới phải khác với email hiện tại!');
      setLoading(false);
      return;
    }

    try {
      await authService.changeEmail({
        newEmail: emailData.newEmail,
        password: emailData.password
      });

      toast.success('Đổi email thành công! Vui lòng kiểm tra email để xác thực.');
      setSuccess('Email đã được thay đổi thành công! Vui lòng kiểm tra email mới để xác thực.');
      setEmailData({
        newEmail: '',
        password: ''
      });
      
      // Update user context
      if (user) {
        updateUser({
          ...user,
          email: emailData.newEmail,
          emailVerified: false
        });
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
            await authService.resendVerification({ email: user.email });
      toast.success('Email xác thực đã được gửi lại!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file phải nhỏ hơn 5MB!');
      return;
    }

    setUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const avatarUrl = await authService.uploadAvatar(file);
      
      // Update user context with new avatar
      if (user) {
        updateUser({
          ...user,
          avatar: avatarUrl
        });
      }

      toast.success('Cập nhật ảnh đại diện thành công!');
      setSuccess('Ảnh đại diện đã được cập nhật thành công!');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải ảnh';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryZipFile || !galleryThumbnail || !galleryName) {
      setGalleryError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setGalleryUploading(true);
    setGalleryError('');
    setGallerySuccess('');
    try {
      await galleryService.upload(galleryZipFile, galleryThumbnail, galleryName);
      setGallerySuccess('Tải lên thành công!');
      setShowGalleryModal(false);
  fetchGalleryAll();
      setGalleryName(''); setGalleryZipFile(null); setGalleryThumbnail(null);
    } catch {
      setGalleryError('Lỗi khi tải lên gallery');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleGalleryDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá gallery này?')) return;
    try {
      await galleryService.delete(id);
  fetchGalleryAll();
    } catch {
      setGalleryError('Lỗi khi xoá gallery');
    }
  };

  const handleGallerySetActiveStatus = async (id: number, active: boolean) => {
    try {
      await galleryService.setActiveStatus(id, active);
      fetchGalleryAll();
    } catch {
      setGalleryError('Lỗi khi chuyển trạng thái gallery');
    }
  };

  // Generate floating particles for profile page
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

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Vui lòng đăng nhập để xem trang hồ sơ cá nhân.
        </Alert>
      </Container>
    );
  }

  return (
    <div className={styles.profilePage}>
      {/* Dynamic Background */}
      <div className={styles.backgroundContainer}>
        <img
          src={getBackgroundUrl(currentBg)}
          alt="Profile Background"
          className={styles.backgroundImage}
        />
      </div>
      <div className={styles.backgroundOverlay} />
      
      {/* Floating Particles */}
      <div className={styles.particles}>
        {generateParticles()}
      </div>

      <Container className={styles.profileContainer}>
        <Row>
        <Col lg={3} className="mb-4">
          <Card className={styles.sidebarCard}>
            <Card.Header className={styles.sidebarHeader}>
              <div className={styles.userInfo}>
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt="Avatar"
                  className={styles.avatar}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getAvatarUrl();
                  }}
                />
                <div>
                  <h6 className={styles.userName}>{user.fullName || user.username}</h6>
                  <div className={styles.userEmail}>
                    {user.email}
                    {user.emailVerified ? (
                      <Badge bg="success" className="ms-2">Đã xác thực</Badge>
                    ) : (
                      <Badge bg="warning" className="ms-2">Chưa xác thực</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card.Header>
            
            <Nav variant="pills" className={`flex-column ${styles.sidebarNav}`}>
              <Nav.Item>
                <Nav.Link 
                  className={`${styles.navLink} ${activeTab === 'info' ? styles.active : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="fas fa-user me-2"></i>
                  Thông tin
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  className={`${styles.navLink} ${activeTab === 'security' ? styles.active : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="fas fa-shield-alt me-2"></i>
                  Bảo mật
                </Nav.Link>
              </Nav.Item>
              {user?.role === 'ADMIN' && (
                <Nav.Item>
                  <Nav.Link 
                    className={`${styles.navLink} ${activeTab === 'gallery' ? styles.active : ''}`}
                    onClick={() => setActiveTab('gallery')}
                  >
                    <i className="fas fa-images me-2"></i>
                    Gallery
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Card>
        </Col>
        <Col lg={9}>
          <Card className={styles.contentCard}>
            <Card.Header className={styles.contentHeader}>
              <h4 className={styles.contentTitle}>
                {activeTab === 'info' ? (
                  <>
                    <i className="fas fa-user me-2"></i>
                    Thông tin cá nhân
                  </>
                ) : activeTab === 'security' ? (
                  <>
                    <i className="fas fa-shield-alt me-2"></i>
                    Bảo mật tài khoản
                  </>
                ) : (
                  <>
                    <i className="fas fa-images me-2"></i>
                    Quản lý Gallery
                  </>
                )}
              </h4>
            </Card.Header>
            <Card.Body className={styles.contentBody}>
              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {activeTab === 'info' && (
                <>
                  {/* Avatar Upload Section */}
                  <div className={`${styles.avatarSection} mb-4`}>
                    <div className="text-center">
                      <div className={styles.avatarContainer}>
                        <img 
                          src={getAvatarUrl(user?.avatar)}
                          alt="Avatar"
                          className={styles.avatarImage}
                        />
                        <div className={styles.avatarOverlay}>
                          {uploadingAvatar ? (
                            <i className="fas fa-spinner fa-spin text-white" style={{ fontSize: '1.5rem' }}></i>
                          ) : (
                            <i className="fas fa-camera text-white" style={{ fontSize: '1.5rem' }}></i>
                          )}
                        </div>
                        <input
                          type="file"
                          id="avatarInput"
                          className={styles.avatarInput}
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={uploadingAvatar}
                        />
                      </div>
                      <div className="mt-3">
                        <label 
                          htmlFor="avatarInput" 
                          className={`btn ${uploadingAvatar ? 'btn-secondary' : 'btn-outline-primary'} ${styles.avatarBtn}`}
                          style={{ pointerEvents: uploadingAvatar ? 'none' : 'auto' }}
                        >
                          <i className={`fas ${uploadingAvatar ? 'fa-spinner fa-spin' : 'fa-upload'} me-2`}></i>
                          {uploadingAvatar ? 'Đang tải lên...' : 'Thay đổi ảnh đại diện'}
                        </label>
                        <p className="text-muted small mt-2">
                          Chỉ chấp nhận file JPG, PNG. Kích thước tối đa 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="mb-4" />

                  <Form onSubmit={handleUpdateProfile}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-signature me-2"></i>
                          Họ và tên
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileInputChange}
                          className={styles.formControl}
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-envelope me-2"></i>
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={profileData.email}
                          className={styles.formControl}
                          disabled
                          placeholder="Email"
                        />
                        <Form.Text className="text-muted">
                          Email không thể thay đổi ở đây. Vui lòng sử dụng tab Bảo mật.
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-calendar me-2"></i>
                          Ngày sinh
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="birthday"
                          value={profileData.birthday}
                          onChange={handleProfileInputChange}
                          className={styles.formControl}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-venus-mars me-2"></i>
                          Giới tính
                        </Form.Label>
                        <Form.Select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleProfileInputChange}
                          className={styles.formControl}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-ruler-vertical me-2"></i>
                          Chiều cao (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="height"
                          value={profileData.height}
                          onChange={handleProfileInputChange}
                          className={styles.formControl}
                          placeholder="Nhập chiều cao"
                          min="100"
                          max="250"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className={styles.formLabel}>
                          <i className="fas fa-weight me-2"></i>
                          Cân nặng (kg)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="weight"
                          value={profileData.weight}
                          onChange={handleProfileInputChange}
                          className={styles.formControl}
                          placeholder="Nhập cân nặng"
                          min="30"
                          max="200"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className={styles.buttonGroup}>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className={styles.primaryButton}
                    >
                      {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                      {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </Button>
                  </div>
                </Form>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  {/* Change Password Section */}
                  <div className={styles.securitySection}>
                    <h5 className={styles.sectionTitle}>
                      <i className="fas fa-key me-2"></i>
                      Đổi mật khẩu
                    </h5>
                    <Form onSubmit={handleChangePassword}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className={styles.formLabel}>Mật khẩu hiện tại</Form.Label>
                            <div className={styles.inputGroup}>
                              <Form.Control
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordInputChange}
                                className={styles.formControl}
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                              />
                              <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              >
                                <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className={styles.formLabel}>Mật khẩu mới</Form.Label>
                            <div className={styles.inputGroup}>
                              <Form.Control
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordInputChange}
                                className={styles.formControl}
                                placeholder="Nhập mật khẩu mới"
                                required
                              />
                              <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              >
                                <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className={styles.formLabel}>Xác nhận mật khẩu mới</Form.Label>
                            <div className={styles.inputGroup}>
                              <Form.Control
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordInputChange}
                                className={styles.formControl}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                              />
                              <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              >
                                <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                              </button>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className={styles.primaryButton}
                      >
                        {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                        {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </Button>
                    </Form>
                  </div>

                  <hr className={styles.sectionDivider} />

                  {/* Change Email Section */}
                  <div className={styles.securitySection}>
                    <h5 className={styles.sectionTitle}>
                      <i className="fas fa-envelope me-2"></i>
                      Đổi email
                    </h5>
                    <div className={styles.currentEmailInfo}>
                      <span>Email hiện tại: <strong>{user.email}</strong></span>
                      {!user.emailVerified && (
                        <Button 
                          variant="outline-warning"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={loading}
                          className="ms-3"
                        >
                          Gửi lại email xác thực
                        </Button>
                      )}
                    </div>
                    <Form onSubmit={handleChangeEmail} className="mt-3">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className={styles.formLabel}>Email mới</Form.Label>
                            <Form.Control
                              type="email"
                              name="newEmail"
                              value={emailData.newEmail}
                              onChange={handleEmailInputChange}
                              className={styles.formControl}
                              placeholder="Nhập email mới"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className={styles.formLabel}>Mật khẩu xác nhận</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={emailData.password}
                              onChange={handleEmailInputChange}
                              className={styles.formControl}
                              placeholder="Nhập mật khẩu để xác nhận"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className={styles.primaryButton}
                      >
                        {loading && <i className={`fas fa-spinner ${styles.loadingSpinner}`}></i>}
                        {loading ? 'Đang đổi...' : 'Đổi email'}
                      </Button>
                    </Form>
                  </div>
                </>
              )}

              {activeTab === 'gallery' && user?.role === 'ADMIN' && (
                <>
                  {galleryError && <Alert variant="danger">{galleryError}</Alert>}
                  {gallerySuccess && <Alert variant="success">{gallerySuccess}</Alert>}
                  <Button variant="primary" onClick={() => setShowGalleryModal(true)} className="mb-3">
                    Tải lên Gallery mới
                  </Button>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Thumbnail</th>
                        <th>Tên</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gallery.map(item => (
                        <tr key={item.id}>
                          <td>
                            <img
                              src={getGalleryItemUrl(item.thumbnailUrl)}
                              alt="thumb"
                              style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                              onClick={e => {
                                e.stopPropagation();
                                setZoomImage(getGalleryItemUrl(item.thumbnailUrl));
                              }}
                            />
                          </td>
                          <td>{item.displayName}</td>
                          <td>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</td>
                          <td>{new Date(item.createdAt).toLocaleString()}</td>
                          <td>
                            {item.isActive ? (
                              <Button variant="warning" size="sm" onClick={() => handleGallerySetActiveStatus(item.id, false)} className="me-2">Inactive</Button>
                            ) : (
                              <Button variant="success" size="sm" onClick={() => handleGallerySetActiveStatus(item.id, true)} className="me-2">Active</Button>
                            )}
                            <Button variant="danger" size="sm" onClick={() => handleGalleryDelete(item.id)}>Xoá</Button>
                            <Button variant="info" size="sm" onClick={() => handleOpenEditFolder(item)} className="ms-2">Chỉnh sửa</Button>
                          </td>
      {/* Modal chỉnh sửa folder */}
      <Modal show={editFolderModal.open} onHide={handleCloseEditFolder} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa Gallery: {editFolderModal.folder?.displayName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingItems ? (
            <div>Đang tải danh sách item...</div>
          ) : (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Ảnh/Video</th>
                    <th>Tên file</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {folderItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.itemType === 'IMAGE' ? (
                          <img
                            src={getAvatarUrl(item.fileUrl)}
                            alt={item.fileName}
                            style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setZoomImage(getAvatarUrl(item.fileUrl))}
                          />
                        ) : (
                          <span>Video</span>
                        )}
                      </td>
                      <td>{item.fileName}</td>
                      <td>{item.itemType}</td>
                      <td>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        {item.isActive ? (
                          <Button variant="warning" size="sm" disabled={itemActionLoading} onClick={() => handleSetItemActiveStatus(item.id, false)} className="me-2">Inactive</Button>
                        ) : (
                          <Button variant="success" size="sm" disabled={itemActionLoading} onClick={() => handleSetItemActiveStatus(item.id, true)} className="me-2">Active</Button>
                        )}
                        <Button variant="danger" size="sm" disabled={itemActionLoading} onClick={() => handleDeleteItem(item.id)}>Xoá</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <hr />
              <Form onSubmit={handleAddItem}>
                <Form.Group className="mb-3">
                  <Form.Label>Thêm item mới</Form.Label>
                  <Form.Control type="file" accept="image/*,video/*" onChange={e => setAddItemFile((e.target as HTMLInputElement).files?.[0] || null)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Loại</Form.Label>
                  <Form.Select value={addItemType} onChange={e => setAddItemType(e.target.value as 'IMAGE' | 'VIDEO')}>
                    <option value="IMAGE">Ảnh</option>
                    <option value="VIDEO">Video</option>
                  </Form.Select>
                </Form.Group>
                {addItemError && <Alert variant="danger">{addItemError}</Alert>}
                <Button type="submit" variant="primary" disabled={itemActionLoading}>{itemActionLoading ? 'Đang thêm...' : 'Thêm item'}</Button>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditFolder}>Đóng</Button>
        </Modal.Footer>
      </Modal>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Modal show={showGalleryModal} onHide={() => setShowGalleryModal(false)}>
                    <Modal.Header closeButton>
                      <Modal.Title>Tải lên Gallery mới</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleGalleryUpload}>
                      <Modal.Body>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên Gallery</Form.Label>
                          <Form.Control type="text" value={galleryName} onChange={e => setGalleryName(e.target.value)} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>File ZIP</Form.Label>
                          <Form.Control type="file" accept=".zip" onChange={e => setGalleryZipFile((e.target as HTMLInputElement).files?.[0] || null)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Thumbnail</Form.Label>
                          <Form.Control type="file" accept="image/*" onChange={e => setGalleryThumbnail((e.target as HTMLInputElement).files?.[0] || null)} required />
                        </Form.Group>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowGalleryModal(false)}>Đóng</Button>
                        <Button type="submit" variant="primary" disabled={galleryUploading}>{galleryUploading ? 'Đang tải lên...' : 'Tải lên'}</Button>
                      </Modal.Footer>
                    </Form>
                  </Modal>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    {/* Modal phóng to ảnh - render ngoài bảng, tránh lỗi HTML */}
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

export default ProfilePage;

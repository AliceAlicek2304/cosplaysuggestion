import { config } from '../config/config';

export const getAvatarUrl = (avatar?: string): string => {
  // If avatar is null/undefined or empty, return default avatar
  if (!avatar || avatar.trim() === '') {
    if (config.STORAGE_TYPE === 's3') {
      return `${config.S3_BASE_URL}/avatars/default-avatar.jpg`;
    } else {
      return `${config.LOCAL_AVATAR_URL}/default-avatar.jpg`;
    }
  }
  
  // If avatar already contains full URL (starts with http), return as is
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // If avatar starts with s3://, convert to HTTPS URL
  if (avatar.startsWith('s3://')) {
    const s3Path = avatar.replace('s3://cosplay-suggestion-files/', '');
    return `${config.S3_BASE_URL}/${s3Path}`;
  }
  
  // If avatar starts with /, it's a relative path from server root
  if (avatar.startsWith('/')) {
    return `${config.API_BASE_URL}${avatar}`;
  }
  
  // For production with S3, assume it's a key in avatars folder
  if (config.STORAGE_TYPE === 's3') {
    return `${config.S3_BASE_URL}/avatars/${avatar}`;
  }
  
  // For local development, construct the full URL
  return `${config.LOCAL_AVATAR_URL}/${avatar}`;
};

export const getBackgroundUrl = (backgroundId: number | string): string => {
  if (config.STORAGE_TYPE === 's3') {
    return `${config.S3_BASE_URL}/backgrounds/${backgroundId}.jpg`;
  } else {
    return `${config.LOCAL_BACKGROUND_URL}/${backgroundId}.jpg`;
  }
};

export const getUserDisplayName = (user: { fullName?: string; username?: string } | null): string => {
  if (!user) return 'Guest';
  return user.fullName || user.username || 'Unknown User';
};

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ số' };
  }
  
  return { isValid: true, message: 'Mật khẩu hợp lệ' };
};

// Chuyển đổi thông báo lỗi từ backend (tiếng Anh) sang tiếng Việt thân thiện
export const translateErrorMessage = (errorMessage: string): string => {
  const errorTranslations: { [key: string]: string } = {
    'Bad credentials': 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
    'Invalid username/email or password!': 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
    'Account is disabled. Please contact administrator!': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!',
    'User not found': 'Không tìm thấy tài khoản này!',
    'Access Denied': 'Bạn không có quyền truy cập!',
    'Token expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
    'Invalid token': 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!',
    'Network Error': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet!',
    'Internal Server Error': 'Lỗi hệ thống. Vui lòng thử lại sau!',
    'Request failed with status code 400': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại!',
    'Request failed with status code 401': 'Tên đăng nhập hoặc mật khẩu không chính xác!',
    'Request failed with status code 403': 'Bạn không có quyền thực hiện thao tác này!',
    'Request failed with status code 404': 'Không tìm thấy thông tin yêu cầu!',
    'Request failed with status code 500': 'Lỗi hệ thống. Vui lòng thử lại sau!',
    // Forgot password errors
    'Account not found': 'Không tìm thấy tài khoản với thông tin này!',
    'Reset code expired': 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới!',
    'Invalid reset code': 'Mã xác nhận không hợp lệ!',
    'Password mismatch': 'Mật khẩu xác nhận không khớp!',
    'Mã xác nhận không hợp lệ!': 'Mã xác nhận không hợp lệ!',
    'Mã xác nhận đã hết hạn!': 'Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới!',
    'Mật khẩu xác nhận không khớp!': 'Mật khẩu xác nhận không khớp!',
    'Không tìm thấy tài khoản!': 'Không tìm thấy tài khoản với thông tin này!'
  };

  // Tìm kiếm thông báo lỗi phù hợp
  for (const [englishError, vietnameseError] of Object.entries(errorTranslations)) {
    if (errorMessage && errorMessage.includes(englishError)) {
      return vietnameseError;
    }
  }

  // Nếu không tìm thấy, trả về thông báo mặc định
  return errorMessage || 'Có lỗi xảy ra. Vui lòng thử lại!';
};

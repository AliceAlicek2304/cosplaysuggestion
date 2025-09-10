# 🎭 CosplaySuggestion

Một website thông minh giúp tìm kiếm và gợi ý trang phục cosplay phù hợp với từng người dùng, tích hợp AI để phân tích và đề xuất sản phẩm từ Taobao. Dự án mini full-stack sẵn sàng deploy lên AWS.

## 🌟 Tính năng chính

### 🤖 AI-Powered Cosplay Suggestion Engine
- Sử dụng trí tuệ nhân tạo để phân tích thông tin người dùng
- Đưa ra gợi ý cosplay phù hợp với thông số cơ thể và sở thích
- Tự động điền thông tin từ profile (chiều cao, cân nặng, giới tính)
- Persistent form state - giữ thông tin khi điều hướng
- Tính toán độ khó thực hiện và điểm phù hợp

### 🛍️ Tìm kiếm sản phẩm
- Tự động tìm kiếm **40 sản phẩm** cosplay từ Taobao
- So sánh giá cả và đưa ra gợi ý tốt nhất
- Hiển thị giá theo VND và yuan Trung Quốc
- Phân trang thông minh (6 sản phẩm/trang)

### 💰 Phân tích ngân sách
- Tính toán chi tiết chi phí cosplay
- Đưa ra lời khuyên tối ưu hóa ngân sách
- Phân tích theo từng item cần thiết

### 👤 Hệ thống Authentication & Profile Management
- **Authentication**: Đăng ký/đăng nhập an toàn với JWT token
- **Profile Management**: Trang profile với sidebar navigation (Thông tin, Bảo mật)
- **Avatar Upload**: Upload ảnh đại diện với validation
- **Account Security**: Đổi mật khẩu, đổi email với verification
- **Personal Info**: Cập nhật thông tin cá nhân đầy đủ
- **Guest Support**: Hỗ trợ cả người dùng khách (với thông tin bắt buộc)

### 🎨 UI/UX Features
- **Dynamic Background**: Background thay đổi tự động với particles animation
- **Responsive Design**: Bootstrap components, mobile-friendly
- **Smooth Navigation**: Hash-based routing với scroll effects
- **Toast Notifications**: Feedback system cho user actions
- **Loading States**: Spinner và error handling đầy đủ
- **Modal Interactions**: Clean modal-based workflows

### 📋 Gợi ý chi tiết
- **Khuyến nghị chi tiết**: Hướng dẫn từng bước thực hiện
- **Danh sách vật phẩm**: Checklist đầy đủ các item cần mua
- **Mẹo hữu ích**: Tricks và tips từ cộng đồng cosplayer
- **Gợi ý thay thế**: Các nhân vật tương tự nếu không phù hợp
- **Pose Suggestions**: Gợi ý pose chụp ảnh phù hợp

## 🏗️ Kiến trúc hệ thống

### Backend (Spring Boot)
```
📁 backend/
├── 🎯 Java 24 + Spring Boot 3.5.4
├── 🔐 Spring Security + JWT Authentication
├── 🗄️ JPA/Hibernate + MySQL Database
├── 🤖 AI Integration (OpenAI/Claude) cho gợi ý cosplay
├── 🛒 Taobao API Integration
├── 📧 Email Verification Service (SMTP)
├── 📁 File Upload Management (Avatar, Background)
└── 🛡️ Role-based Access Control (USER, ADMIN)
```

### Frontend (React TypeScript)
```
📁 frontend/
├── ⚛️ React 19.1.1 + TypeScript
├── 🎨 Bootstrap 5.3.7 + React Bootstrap
├── 🎪 Responsive Design với CSS Modules
├── 🧭 Hash-based Routing
├── 🎭 Context API cho State Management
├── 💾 LocalStorage cho Form Persistence
├── 🌙 Dynamic Background với Particles Animation
└── 📱 Mobile-friendly Interface
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Java**: 24+
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Maven**: 3.8+

### 1. Clone repository
```bash
git clone https://github.com/AliceAlicek2304/cosplaysuggestion.git
cd cosplaysuggestion
```

### 2. Cấu hình Database
```sql
CREATE DATABASE cosplay_suggestion;
```

### 3. Cấu hình Backend
```bash
cd backend

# Tạo file .env hoặc cập nhật application.properties
# Cần cấu hình:
# - Database connection (MySQL)
# - JWT secret key
# - AI API keys (OpenAI/Claude)
# - Taobao API credentials
# - SMTP email settings

# Chạy backend
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 4. Cấu hình Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/account/register` - Đăng ký tài khoản
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `GET /api/auth/verify-email` - Xác thực email

### Account Management
- `GET /api/account/profile` - Lấy thông tin profile
- `PUT /api/account/profile` - Cập nhật thông tin cá nhân
- `POST /api/account/change-password` - Đổi mật khẩu
- `POST /api/account/change-email` - Đổi email
- `POST /api/account/upload-avatar` - Upload avatar
- `GET /api/account/check-username` - Kiểm tra username
- `GET /api/account/check-email` - Kiểm tra email

### Cosplay Suggestions
- `POST /api/cosplay/suggestion` - Tạo gợi ý cosplay
  - Hỗ trợ cả user đã đăng nhập và guest
  - Trả về 40 sản phẩm từ Taobao
  - Bao gồm phân tích AI chi tiết với pose suggestions

### Static Resources
- `GET /api/background/{filename}` - Background images
- `GET /api/avatar/{filename}` - User avatars

## 🎨 Giao diện

### 🌙 Modern UI với phong cách Anime/Gaming
- Màu chủ đạo: Gradient xanh tím (#4a69bd → #6c7ce7)
- Dynamic background slideshow với particles animation
- Bootstrap components với custom styling
- Responsive design cho mọi thiết bị
- Toast notifications cho user feedback

### 📱 Mobile-First Design
- Tối ưu cho mobile và tablet
- Touch-friendly navigation
- Adaptive layouts

## 🔧 Cấu hình nâng cao

### Environment Variables
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cosplay_suggestion
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

## 📦 Sẵn sàng cho AWS Deployment

Project này được thiết kế sẵn sàng cho việc deploy lên AWS với các thành phần:

### 🏗️ AWS Architecture Ready
- **Frontend**: React app → S3 + CloudFront
- **Backend**: Spring Boot → EC2/ECS + ALB
- **Database**: MySQL → RDS
- **File Storage**: Local uploads → S3
- **Domain**: Route 53 + SSL certificates

### 🐳 Containerization Ready
- Dockerfile cho backend Spring Boot
- Dockerfile cho frontend React
- Docker Compose cho local development
- Environment variables configuration

### 🔒 Security Features
- JWT authentication với secure headers
- CORS configuration cho production
- Input validation và sanitization
- File upload security với type checking

## 🚀 Demo Features

### 🎯 Core Workflow
1. **Guest User**: Nhập thông tin → Tìm kiếm → Nhận gợi ý AI
2. **Registered User**: Đăng nhập → Auto-fill profile → Enhanced suggestions
3. **Profile Management**: Update info → Upload avatar → Security settings

### 🤖 AI Integration
- Character analysis dựa trên input
- Body measurement compatibility checking
- Cost estimation với budget optimization
- Pose suggestions cho photography
- Alternative character recommendations

## 📊 Technical Specifications

### Performance
- **Frontend**: Code splitting, lazy loading, optimized images
- **Backend**: JPA optimizations, caching strategies
- **Database**: Indexed queries, connection pooling
- **API**: RESTful design với error handling

### Scalability
- Stateless backend architecture
- JWT-based authentication (no sessions)
- File storage ready for S3 migration
- Database schema supports horizontal scaling

## 🛠️ Environment Configuration

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cosplay_suggestion
spring.datasource.username=your-username
spring.datasource.password=your-password

# JWT
jwt.secret=your-super-secure-secret-key
jwt.expiration=86400000

# AI Service (OpenAI/Claude)
ai.api.url=https://api.openai.com/v1
ai.api.key=your-openai-api-key

# Taobao API
taobao.api.url=https://api.taobao.com
taobao.api.key=your-taobao-api-key

# Email Service
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# File Upload
file.upload-dir=./uploads
file.max-size=10MB
```

## 📊 Tính năng nổi bật

### 🎭 Smart Form Management
- **Auto-fill từ profile**: Tự động điền height, weight, gender
- **Form persistence**: LocalStorage giữ dữ liệu khi navigate
- **Guest support**: Validation cho user chưa đăng nhập
- **Real-time validation**: Check username/email availability

### 🎨 Modern UI/UX
- **Dynamic backgrounds**: 4 ảnh rotating tự động
- **Particles animation**: Floating elements với CSS animations
- **Responsive modals**: Full-screen trên mobile, centered trên desktop
- **Toast notifications**: User feedback cho mọi actions
- **Loading states**: Spinner và progress indicators

### 🔐 Complete Authentication Flow
- **Registration**: Email verification required
- **Login**: JWT với refresh token strategy
- **Password reset**: Email-based flow
- **Profile management**: Complete CRUD operations
- **Avatar upload**: File validation với unique naming

## 🤝 Đóng góp

Dự án này được phát triển như một mini project học tập cho AWS deployment practice.

### Cách đóng góp:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 🎓 Learning Project

Đây là project thực hành cho:
- **Full-stack development** với Spring Boot + React
- **AWS deployment** practice với FCJ course
- **Modern web development** patterns và best practices
- **AI integration** trong web applications

## 📝 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Tác giả

- **Alice** - *Full-stack Developer* - [@AliceAlicek2304](https://github.com/AliceAlicek2304)

## 🙏 Cảm ơn

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [React](https://reactjs.org/) - Frontend library  
- [Bootstrap](https://getbootstrap.com/) - UI framework
- [Taobao API](https://www.taobao.com/) - Product data source
- [OpenAI](https://openai.com/) - AI analysis service
- [FCJ Course](https://fcj.vn/) - AWS learning platform

---

⭐ **Ready for AWS deployment!** Nếu bạn thấy dự án này hữu ích cho việc học AWS, hãy cho một star trên GitHub!

# Backend - Student Activity Portal

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **ORM**: Prisma 6 (PostgreSQL)
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Email**: Nodemailer
- **Password**: bcryptjs

---

## Cấu trúc thư mục

```
backend/
├── prisma/
│   └── schema.prisma              # Prisma schema - định nghĩa toàn bộ models
│
├── src/
│   ├── config/
│   │   ├── env.js                 # Validate required environment variables
│   │   ├── prisma.js              # PrismaClient singleton
│   │   └── db.js                  # Kết nối / ngắt kết nối database
│   │
│   ├── modules/                   # Tổ chức theo domain (feature-first)
│   │   ├── auth/
│   │   │   ├── auth.controller.js # Xử lý HTTP request/response
│   │   │   ├── auth.service.js    # Business logic
│   │   │   ├── auth.route.js      # Khai báo endpoints
│   │   │   └── auth.validation.js # Zod schemas cho input validation
│   │   │
│   │   ├── nguoi-dung/
│   │   │   ├── nguoi-dung.controller.js
│   │   │   ├── nguoi-dung.service.js
│   │   │   ├── nguoi-dung.route.js
│   │   │   └── nguoi-dung.validation.js
│   │   │
│   │   ├── to-chuc/
│   │   │   ├── to-chuc.controller.js
│   │   │   ├── to-chuc.service.js
│   │   │   ├── to-chuc.route.js
│   │   │   └── to-chuc.validation.js
│   │   │
│   │   ├── hoat-dong/
│   │   │   ├── hoat-dong.controller.js
│   │   │   ├── hoat-dong.service.js
│   │   │   ├── hoat-dong.route.js
│   │   │   └── hoat-dong.validation.js
│   │   │
│   │   ├── phieu-dang-ky/
│   │   │   ├── phieu-dang-ky.controller.js
│   │   │   ├── phieu-dang-ky.service.js
│   │   │   ├── phieu-dang-ky.route.js
│   │   │   └── phieu-dang-ky.validation.js
│   │   │
│   │   ├── dot-tuyen-clb/
│   │   │   ├── dot-tuyen-clb.controller.js
│   │   │   ├── dot-tuyen-clb.service.js
│   │   │   ├── dot-tuyen-clb.route.js
│   │   │   └── dot-tuyen-clb.validation.js
│   │   │
│   │   ├── thong-bao/
│   │   │   ├── thong-bao.controller.js
│   │   │   ├── thong-bao.service.js
│   │   │   └── thong-bao.route.js
│   │   │
│   │   └── admin/
│   │       ├── admin.controller.js
│   │       ├── admin.service.js
│   │       └── admin.route.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Xác thực JWT token
│   │   ├── role.middleware.js      # Phân quyền RBAC
│   │   ├── validate.middleware.js  # Chạy Zod validation schema
│   │   └── error.middleware.js     # Global error handler
│   │
│   ├── utils/
│   │   ├── id.js                   # Generate custom VARCHAR ID (nanoid/uuid)
│   │   ├── jwt.js                  # Sign / verify JWT token
│   │   ├── response.js             # Chuẩn hóa API response { success, data, error }
│   │   ├── mailer.js               # Nodemailer config + send helpers
│   │   └── constants.js            # Enums, static values
│   │
│   ├── app.js                      # Express app setup + đăng ký routes
│   └── server.js                   # Entry point - khởi động server
│
├── .env                            # Biến môi trường (không commit)
├── .env.example                    # Template biến môi trường
└── package.json
```

---

## API Routes

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | No | Đăng ký tài khoản |
| POST | `/api/auth/login` | No | Đăng nhập |
| GET | `/api/auth/me` | JWT | Thông tin người dùng hiện tại |
| GET | `/api/nguoi-dung/profile` | JWT | Xem profile |
| PUT | `/api/nguoi-dung/profile` | JWT | Cập nhật profile |
| PUT | `/api/nguoi-dung/change-password` | JWT | Đổi mật khẩu |
| GET | `/api/to-chuc` | No | Danh sách tổ chức/CLB |
| GET | `/api/to-chuc/:id` | No | Chi tiết tổ chức |
| POST | `/api/to-chuc` | JWT + Admin | Tạo tổ chức |
| PUT | `/api/to-chuc/:id` | JWT + Admin/CLB | Cập nhật tổ chức |
| GET | `/api/hoat-dong` | No | Danh sách hoạt động |
| GET | `/api/hoat-dong/:id` | No | Chi tiết hoạt động |
| POST | `/api/hoat-dong` | JWT + Admin/CLB | Tạo hoạt động |
| PUT | `/api/hoat-dong/:id` | JWT + Admin/CLB | Cập nhật hoạt động |
| DELETE | `/api/hoat-dong/:id` | JWT + Admin | Xóa hoạt động |
| POST | `/api/phieu-dang-ky` | JWT | Đăng ký tham gia |
| GET | `/api/phieu-dang-ky/my` | JWT | Phiếu đăng ký của tôi |
| DELETE | `/api/phieu-dang-ky/:id` | JWT | Hủy đăng ký |
| GET | `/api/dot-tuyen-clb` | No | Danh sách đợt tuyển |
| POST | `/api/dot-tuyen-clb` | JWT + Admin/CLB | Tạo đợt tuyển |
| POST | `/api/dot-tuyen-clb/:id/ung-tuyen` | JWT | Nộp đơn ứng tuyển |
| GET | `/api/thong-bao` | JWT | Danh sách thông báo |
| GET | `/api/admin/stats` | JWT + Admin | Thống kê dashboard |
| GET | `/api/admin/hoat-dong/:id/dang-ky` | JWT + Admin/CLB | Danh sách đăng ký theo hoạt động |

---

## Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema lên database
npx prisma db push

# Chạy development
npm run dev

# Chạy production
npm start
```

---

## Environment Variables

Sao chép `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

| Biến | Mô tả |
|------|-------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secret key ký JWT |
| `JWT_EXPIRE` | Thời hạn JWT (vd: `7d`) |
| `NODE_ENV` | `development` hoặc `production` |
| `PORT` | Port server (mặc định: 3000) |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | Email gửi |
| `MAIL_PASS` | App password email |

---

## Database

PostgreSQL chạy qua Docker:

```bash
# Kiểm tra container
docker ps

# Tên container: clb_database_container
# Host: localhost:5432
# Database: clb_db
# User: root / Password: root
```

Xem dữ liệu qua Prisma Studio:

```bash
npx prisma studio
```

# Student Activity Portal

Nền tảng quản lý hoạt động sinh viên cho các câu lạc bộ và tổ chức trong trường đại học.

## Kiến trúc

```
Student-Activity-Portal/
├── backend/              # Node.js + Express + Prisma (REST API)
├── frontend/eventfe/     # Next.js 15 (App Router)
├── ai-service/           # Python FastAPI (chatbot AI)
└── environment/
    ├── database/         # seed.js, schema_init.sql
    └── start/            # docker-compose.yml, start.sh, stop.sh
```

## Yêu cầu môi trường

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | 18.x trở lên |
| Python  | 3.10 trở lên |
| Docker  | 24.x trở lên |
| Docker Compose | v2 trở lên |

---

## Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <repo-url>
cd Student-Activity-Portal
```

### 2. Khởi động PostgreSQL + Redis (Docker)

```bash
cd environment/start
docker compose up -d
```

Đợi cho đến khi cả hai dịch vụ healthy (khoảng 10-15 giây).

Hoặc dùng script tự động:

```bash
# Linux/macOS
chmod +x environment/start/start.sh
./environment/start/start.sh

# Windows (Git Bash)
bash environment/start/start.sh
```

### 3. Cấu hình Backend

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
DATABASE_URL="postgresql://root:root@localhost:5432/clb_db"
JWT_SECRET="your_super_secret_key_here"
PORT=3000
NODE_ENV=development

# Email (tùy chọn - dùng cho gửi mail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="Student Activity Portal <your_email@gmail.com>"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 (tùy chọn - dùng cho upload ảnh)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket

# AI Service
AI_SERVICE_URL=http://localhost:3001
AI_SERVICE_SECRET=your_shared_secret_here
```

Cài đặt dependencies và migrate database:

```bash
cd backend
npm install
npx prisma migrate deploy   # chạy migrations
# hoặc lần đầu dùng:
npx prisma db push          # push schema (không tạo migration files)
```

Seed dữ liệu mẫu:

```bash
npm run seed
```

> Tài khoản mặc định sau seed:
> - Admin: `admin@test.com` / `Admin@123`
> - Leader: `leader1@test.com` / `Leader@123`
> - Student: `student1@test.com` / `Student@123`

Khởi động backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

Backend chạy tại: `http://localhost:3000`

### 4. Cấu hình Frontend

```bash
cd frontend/eventfe
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```env
NEXT_PUBLIC_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3000/api
COOKIE_ACCESS_TOKEN_MAX_AGE=900
COOKIE_REFRESH_TOKEN_MAX_AGE=604800
```

Cài đặt và chạy:

```bash
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:3002`

### 5. Cấu hình AI Service

```bash
cd ai-service
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
AI_SERVICE_SECRET=your_shared_secret_here   # phải khớp với backend
```

Tạo virtual environment và cài đặt:

```bash
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Khởi động:

```bash
uvicorn main:app --reload --port 3001
```

---

## Ports mặc định

| Dịch vụ | Port |
|---------|------|
| Backend API | 3000 |
| AI Service | 3001 |
| Frontend | 3002 |
| PostgreSQL | 5432 |
| Redis | 6379 |

---

## Lệnh hữu ích

### Backend

```bash
# Xem Prisma Studio (GUI database)
npm run prisma:studio

# Generate lại Prisma client sau khi đổi schema
npx prisma generate

# Tạo migration mới
npx prisma migrate dev --name <ten_migration>

# Reset database (xóa toàn bộ dữ liệu)
npx prisma migrate reset
```

### Docker

```bash
# Dừng containers (giữ dữ liệu)
cd environment/start && docker compose down

# Dừng và xóa luôn dữ liệu
docker compose down -v

# Xem logs
docker compose logs -f postgres
docker compose logs -f redis
```

### Frontend

```bash
# Build production
npm run build
npm start

# Lint
npm run lint
```

---

## Cấu trúc API

Base URL: `http://localhost:3000/api`

| Module | Prefix |
|--------|--------|
| Auth | `/auth` |
| Users | `/users` |
| Organizations | `/organizations` |
| Activities | `/activities` |
| Registrations | `/registrations` |
| Club Applications | `/club-applications` |
| Notifications | `/notifications` |
| Admin | `/admin` |
| System Config | `/system-config` |
| AI Chat | `/ai`, `/chat-sessions` |
| Uploads | `/uploads` |

Xem đầy đủ tại file `Student-Activity-Portal.postman_collection.json` — import vào Postman để test API.

---

## Cấu hình hệ thống (Admin)

Admin có thể tùy chỉnh các quy trình nghiệp vụ tại `/admin/settings`:

| Config key | Mô tả | Mặc định |
|-----------|-------|---------|
| `activity.require_approval` | Bài đăng cần admin duyệt trước khi publish | `true` |
| `activity.max_per_org_per_month` | Số bài đăng tối đa mỗi tổ chức/tháng (0 = không giới hạn) | `0` |
| `registration.auto_approve` | Tự động duyệt đăng ký tham gia | `false` |
| `registration.allow_cancel_after_approve` | Cho phép hủy đăng ký sau khi đã duyệt | `true` |
| `organization.require_approval_for_new` | Tổ chức mới cần admin duyệt | `false` |
| `system.maintenance_mode` | Chế độ bảo trì | `false` |

Hỗ trợ **override per-tổ chức**: admin có thể đặt giá trị riêng cho từng tổ chức, tổ chức đó sẽ áp dụng config riêng thay vì config toàn cục.

---

## Xử lý lỗi thường gặp

**`Can't reach database server at localhost:5432`**
```bash
# Kiểm tra Docker đang chạy
docker ps | grep clb_database_container
# Nếu không thấy:
cd environment/start && docker compose up -d
```

**`Redis connection refused`**
```bash
docker ps | grep clb_redis_container
cd environment/start && docker compose up -d
```

**`Prisma client not generated`**
```bash
cd backend && npx prisma generate
```

**Port đã bị chiếm**
```bash
# Xem process đang dùng port (Windows)
netstat -ano | findstr :3000
# Kill process (thay PID)
taskkill /PID <PID> /F
```

---

## Biến môi trường bắt buộc

| Service | Biến | Ghi chú |
|---------|------|---------|
| Backend | `DATABASE_URL` | PostgreSQL connection string |
| Backend | `JWT_SECRET` | Tối thiểu 32 ký tự |
| Frontend | `NEXT_PUBLIC_API_URL` | URL backend API |
| AI Service | `GEMINI_API_KEY` | Lấy tại Google AI Studio |
| AI Service | `AI_SERVICE_SECRET` | Phải khớp với `AI_SERVICE_SECRET` trong backend |

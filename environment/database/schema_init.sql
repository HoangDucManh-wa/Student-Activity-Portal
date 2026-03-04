-- ==========================================
-- CÁC BẢNG (ID do Backend tự sinh và lưu dưới dạng VARCHAR)
-- ==========================================

-- Bảng NGUOI_DUNG
CREATE TABLE NGUOI_DUNG (
    MaNguoiDung VARCHAR(50) PRIMARY KEY,
    TenNguoiDung VARCHAR(255) NOT NULL,
    MaSV VARCHAR(50),
    SDT VARCHAR(20),
    Email VARCHAR(255) UNIQUE,
    LoaiTaiKhoan VARCHAR(50),
    TrangThai VARCHAR(20),
    MatKhau VARCHAR(255) NOT NULL,
    Avatar TEXT,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng TO_CHUC
CREATE TABLE TO_CHUC (
    MaToChuc VARCHAR(50) PRIMARY KEY,
    TenToChuc VARCHAR(255) NOT NULL,
    LoaiToChuc VARCHAR(50),
    Logo TEXT,
    MoTa TEXT,
    AnhBia TEXT,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng DANH_MUC_HOAT_DONG
CREATE TABLE DANH_MUC_HOAT_DONG (
    MaDanhMuc VARCHAR(50) PRIMARY KEY,
    TenDanhMuc VARCHAR(255) NOT NULL,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng HOAT_DONG
CREATE TABLE HOAT_DONG (
    MaHoatDong VARCHAR(50) PRIMARY KEY,
    TenHoatDong VARCHAR(255) NOT NULL,
    DiaDiem VARCHAR(255),
    ThoiGianBatDau TIMESTAMP,
    ThoiGianKetThuc TIMESTAMP,
    HanDangKy TIMESTAMP,
    SoLuongNguoiToiDa INT,
    DangKyNhom BOOLEAN,
    TrangThaiPheDuyet VARCHAR(50),
    AnhBia TEXT,
    MoTa TEXT,
    MaToChuc VARCHAR(50) NOT NULL REFERENCES TO_CHUC(MaToChuc),
    MaDanhMuc VARCHAR(50) NOT NULL REFERENCES DANH_MUC_HOAT_DONG(MaDanhMuc),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng PHIEU_DANG_KY
CREATE TABLE PHIEU_DANG_KY (
    MaPhieu VARCHAR(50) PRIMARY KEY,
    TrangThai VARCHAR(50),
    ThoiGianDangKy TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LoaiDangKy VARCHAR(50),
    MaNguoiDung VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    MaHoatDong VARCHAR(50) NOT NULL REFERENCES HOAT_DONG(MaHoatDong),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng THANH_VIEN_TO_CHUC
CREATE TABLE THANH_VIEN_TO_CHUC (
    MaNguoiDung VARCHAR(50) REFERENCES NGUOI_DUNG(MaNguoiDung),
    MaToChuc VARCHAR(50) REFERENCES TO_CHUC(MaToChuc),
    ChucVu VARCHAR(100),
    NgayThamGia DATE,
    PRIMARY KEY (MaNguoiDung, MaToChuc),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng THANH_VIEN_NHOM
CREATE TABLE THANH_VIEN_NHOM (
    MaPhieu VARCHAR(50) REFERENCES PHIEU_DANG_KY(MaPhieu),
    MaNguoiDung VARCHAR(50) REFERENCES NGUOI_DUNG(MaNguoiDung),
    VaiTro VARCHAR(100),
    PRIMARY KEY (MaPhieu, MaNguoiDung),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng DOT_TUYEN_CLB
CREATE TABLE DOT_TUYEN_CLB (
    MaDot VARCHAR(50) PRIMARY KEY,
    TenDot VARCHAR(255) NOT NULL,
    MoTa TEXT,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    TrangThai VARCHAR(50),
    MaToChuc VARCHAR(50) NOT NULL REFERENCES TO_CHUC(MaToChuc),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng DON_UNG_TUYEN
CREATE TABLE DON_UNG_TUYEN (
    MaDon VARCHAR(50) PRIMARY KEY,
    CauTraLoiPhongVan TEXT,
    NgayNop DATE DEFAULT CURRENT_DATE,
    LichPhongVan TIMESTAMP,
    KetQuaPhongVan VARCHAR(100),
    GhiChu TEXT,
    MaDot VARCHAR(50) NOT NULL REFERENCES DOT_TUYEN_CLB(MaDot),
    MaNguoiDung VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng DANH_GIA
CREATE TABLE DANH_GIA (
    MaDanhGia VARCHAR(50) PRIMARY KEY,
    SoSao INT CHECK (SoSao >= 1 AND SoSao <= 5),
    NhanXet TEXT,
    ThoiGianDanhGia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MaPhieu VARCHAR(50) UNIQUE NOT NULL REFERENCES PHIEU_DANG_KY(MaPhieu),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng CHI_TIET_DIEM_DANH
CREATE TABLE CHI_TIET_DIEM_DANH (
    MaPhieu VARCHAR(50) PRIMARY KEY REFERENCES PHIEU_DANG_KY(MaPhieu),
    ThoiGianCheckin TIMESTAMP,
    ThoiGianCheckout TIMESTAMP,
    MinhChung TEXT,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng TAI_LIEU_TO_CHUC
CREATE TABLE TAI_LIEU_TO_CHUC (
    MaTaiLieu VARCHAR(50) PRIMARY KEY,
    TenTaiLieu VARCHAR(255) NOT NULL,
    DuongDan TEXT NOT NULL,
    PhanLoai VARCHAR(50),
    MaToChuc VARCHAR(50) NOT NULL REFERENCES TO_CHUC(MaToChuc),
    MaNguoiDung VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng NHAT_KY_HE_THONG
CREATE TABLE NHAT_KY_HE_THONG (
    MaNhatKy VARCHAR(50) PRIMARY KEY,
    HanhDong VARCHAR(255),
    ThoiGianThucHien TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DuLieuCu TEXT,
    DuLieuMoi TEXT,
    MaNguoiDung VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng THONG_BAO
CREATE TABLE THONG_BAO (
    MaThongBao VARCHAR(50) PRIMARY KEY,
    TieuDe VARCHAR(255),
    NoiDung TEXT,
    ThoiGianThongBao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThai VARCHAR(50),
    LoaiThongBao VARCHAR(50),
    MaNguoiDung VARCHAR(50) NOT NULL REFERENCES NGUOI_DUNG(MaNguoiDung),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- ==========================================
-- RBAC (Role-Based Access Control)
-- ==========================================

-- Bảng VAI_TRO
CREATE TABLE VAI_TRO (
    MaVaiTro VARCHAR(50) PRIMARY KEY,
    MaCode VARCHAR(50) UNIQUE NOT NULL,
    TenVaiTro VARCHAR(255) NOT NULL,
    MoTa TEXT,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng QUYEN
CREATE TABLE QUYEN (
    MaQuyen VARCHAR(50) PRIMARY KEY,
    MaCode VARCHAR(50) UNIQUE NOT NULL,
    TenQuyen VARCHAR(255) NOT NULL,
    MoTa TEXT,
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng VAI_TRO_QUYEN (Junction N-N)
CREATE TABLE VAI_TRO_QUYEN (
    MaVaiTro VARCHAR(50) REFERENCES VAI_TRO(MaVaiTro),
    MaQuyen VARCHAR(50) REFERENCES QUYEN(MaQuyen),
    PRIMARY KEY (MaVaiTro, MaQuyen),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

-- Bảng NGUOI_DUNG_VAI_TRO (Junction N-N)
CREATE TABLE NGUOI_DUNG_VAI_TRO (
    MaNguoiDung VARCHAR(50) REFERENCES NGUOI_DUNG(MaNguoiDung),
    MaVaiTro VARCHAR(50) REFERENCES VAI_TRO(MaVaiTro),
    PRIMARY KEY (MaNguoiDung, MaVaiTro),
    -- Audit fields
    isDelete BOOLEAN DEFAULT FALSE,
    createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createBy VARCHAR(50),
    deleteBy VARCHAR(50)
);

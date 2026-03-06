-- ==========================================
-- CÁC BẢNG (ID do Backend tự sinh và lưu dưới dạng VARCHAR)
-- Lưu ý: tên cột dùng double quotes để PostgreSQL giữ nguyên mixed case
-- ==========================================

-- Bảng NGUOI_DUNG
CREATE TABLE nguoi_dung (
    "MaNguoiDung" VARCHAR(50) PRIMARY KEY,
    "TenNguoiDung" VARCHAR(255) NOT NULL,
    "MaSV" VARCHAR(50),
    "SDT" VARCHAR(20),
    "Email" VARCHAR(255) UNIQUE,
    "LoaiTaiKhoan" VARCHAR(50),
    "TrangThai" VARCHAR(20),
    "MatKhau" VARCHAR(255) NOT NULL,
    "Avatar" TEXT,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng TO_CHUC
CREATE TABLE to_chuc (
    "MaToChuc" VARCHAR(50) PRIMARY KEY,
    "TenToChuc" VARCHAR(255) NOT NULL,
    "LoaiToChuc" VARCHAR(50),
    "Logo" TEXT,
    "MoTa" TEXT,
    "AnhBia" TEXT,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng DANH_MUC_HOAT_DONG
CREATE TABLE danh_muc_hoat_dong (
    "MaDanhMuc" VARCHAR(50) PRIMARY KEY,
    "TenDanhMuc" VARCHAR(255) NOT NULL,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng HOAT_DONG
CREATE TABLE hoat_dong (
    "MaHoatDong" VARCHAR(50) PRIMARY KEY,
    "TenHoatDong" VARCHAR(255) NOT NULL,
    "DiaDiem" VARCHAR(255),
    "ThoiGianBatDau" TIMESTAMP,
    "ThoiGianKetThuc" TIMESTAMP,
    "HanDangKy" TIMESTAMP,
    "SoLuongNguoiToiDa" INT,
    "DangKyNhom" BOOLEAN,
    "TrangThaiPheDuyet" VARCHAR(50),
    "AnhBia" TEXT,
    "MoTa" TEXT,
    "MaToChuc" VARCHAR(50) NOT NULL REFERENCES to_chuc("MaToChuc"),
    "MaDanhMuc" VARCHAR(50) NOT NULL REFERENCES danh_muc_hoat_dong("MaDanhMuc"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng PHIEU_DANG_KY
CREATE TABLE phieu_dang_ky (
    "MaPhieu" VARCHAR(50) PRIMARY KEY,
    "TrangThai" VARCHAR(50),
    "ThoiGianDangKy" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "LoaiDangKy" VARCHAR(50),
    "MaNguoiDung" VARCHAR(50) NOT NULL REFERENCES nguoi_dung("MaNguoiDung"),
    "MaHoatDong" VARCHAR(50) NOT NULL REFERENCES hoat_dong("MaHoatDong"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng THANH_VIEN_TO_CHUC
CREATE TABLE thanh_vien_to_chuc (
    "MaNguoiDung" VARCHAR(50) REFERENCES nguoi_dung("MaNguoiDung"),
    "MaToChuc" VARCHAR(50) REFERENCES to_chuc("MaToChuc"),
    "ChucVu" VARCHAR(100),
    "NgayThamGia" DATE,
    PRIMARY KEY ("MaNguoiDung", "MaToChuc"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng THANH_VIEN_NHOM
CREATE TABLE thanh_vien_nhom (
    "MaPhieu" VARCHAR(50) REFERENCES phieu_dang_ky("MaPhieu"),
    "MaNguoiDung" VARCHAR(50) REFERENCES nguoi_dung("MaNguoiDung"),
    "VaiTro" VARCHAR(100),
    PRIMARY KEY ("MaPhieu", "MaNguoiDung"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng DOT_TUYEN_CLB
CREATE TABLE dot_tuyen_clb (
    "MaDot" VARCHAR(50) PRIMARY KEY,
    "TenDot" VARCHAR(255) NOT NULL,
    "MoTa" TEXT,
    "NgayBatDau" DATE,
    "NgayKetThuc" DATE,
    "TrangThai" VARCHAR(50),
    "MaToChuc" VARCHAR(50) NOT NULL REFERENCES to_chuc("MaToChuc"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng DON_UNG_TUYEN
CREATE TABLE don_ung_tuyen (
    "MaDon" VARCHAR(50) PRIMARY KEY,
    "CauTraLoiPhongVan" TEXT,
    "NgayNop" DATE DEFAULT CURRENT_DATE,
    "LichPhongVan" TIMESTAMP,
    "KetQuaPhongVan" VARCHAR(100),
    "GhiChu" TEXT,
    "MaDot" VARCHAR(50) NOT NULL REFERENCES dot_tuyen_clb("MaDot"),
    "MaNguoiDung" VARCHAR(50) NOT NULL REFERENCES nguoi_dung("MaNguoiDung"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng DANH_GIA
CREATE TABLE danh_gia (
    "MaDanhGia" VARCHAR(50) PRIMARY KEY,
    "SoSao" INT CHECK ("SoSao" >= 1 AND "SoSao" <= 5),
    "NhanXet" TEXT,
    "ThoiGianDanhGia" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "MaPhieu" VARCHAR(50) UNIQUE NOT NULL REFERENCES phieu_dang_ky("MaPhieu"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng CHI_TIET_DIEM_DANH
CREATE TABLE chi_tiet_diem_danh (
    "MaPhieu" VARCHAR(50) PRIMARY KEY REFERENCES phieu_dang_ky("MaPhieu"),
    "ThoiGianCheckin" TIMESTAMP,
    "ThoiGianCheckout" TIMESTAMP,
    "MinhChung" TEXT,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng TAI_LIEU_TO_CHUC
CREATE TABLE tai_lieu_to_chuc (
    "MaTaiLieu" VARCHAR(50) PRIMARY KEY,
    "TenTaiLieu" VARCHAR(255) NOT NULL,
    "DuongDan" TEXT NOT NULL,
    "PhanLoai" VARCHAR(50),
    "MaToChuc" VARCHAR(50) NOT NULL REFERENCES to_chuc("MaToChuc"),
    "MaNguoiDung" VARCHAR(50) NOT NULL REFERENCES nguoi_dung("MaNguoiDung"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng NHAT_KY_HE_THONG
CREATE TABLE nhat_ky_he_thong (
    "MaNhatKy" VARCHAR(50) PRIMARY KEY,
    "HanhDong" VARCHAR(255),
    "ThoiGianThucHien" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "DuLieuCu" TEXT,
    "DuLieuMoi" TEXT,
    "MaNguoiDung" VARCHAR(50) NOT NULL REFERENCES nguoi_dung("MaNguoiDung"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng THONG_BAO
CREATE TABLE thong_bao (
    "MaThongBao" VARCHAR(50) PRIMARY KEY,
    "TieuDe" VARCHAR(255),
    "NoiDung" TEXT,
    "ThoiGianThongBao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "TrangThai" VARCHAR(50),
    "LoaiThongBao" VARCHAR(50),
    "MaNguoiDung" VARCHAR(50) NOT NULL REFERENCES nguoi_dung("MaNguoiDung"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- ==========================================
-- RBAC (Role-Based Access Control)
-- ==========================================

-- Bảng VAI_TRO
CREATE TABLE vai_tro (
    "MaVaiTro" VARCHAR(50) PRIMARY KEY,
    "MaCode" VARCHAR(50) UNIQUE NOT NULL,
    "TenVaiTro" VARCHAR(255) NOT NULL,
    "MoTa" TEXT,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng QUYEN
CREATE TABLE quyen (
    "MaQuyen" VARCHAR(50) PRIMARY KEY,
    "MaCode" VARCHAR(50) UNIQUE NOT NULL,
    "TenQuyen" VARCHAR(255) NOT NULL,
    "MoTa" TEXT,
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng VAI_TRO_QUYEN (Junction N-N)
CREATE TABLE vai_tro_quyen (
    "MaVaiTro" VARCHAR(50) REFERENCES vai_tro("MaVaiTro"),
    "MaQuyen" VARCHAR(50) REFERENCES quyen("MaQuyen"),
    PRIMARY KEY ("MaVaiTro", "MaQuyen"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

-- Bảng NGUOI_DUNG_VAI_TRO (Junction N-N)
CREATE TABLE nguoi_dung_vai_tro (
    "MaNguoiDung" VARCHAR(50) REFERENCES nguoi_dung("MaNguoiDung"),
    "MaVaiTro" VARCHAR(50) REFERENCES vai_tro("MaVaiTro"),
    PRIMARY KEY ("MaNguoiDung", "MaVaiTro"),
    -- Audit fields
    "isDelete" BOOLEAN DEFAULT FALSE,
    "createAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createBy" VARCHAR(50),
    "deleteBy" VARCHAR(50)
);

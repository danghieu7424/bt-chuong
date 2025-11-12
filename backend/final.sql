-- Bảng người dùng (chung cho sinh viên & giảng viên & admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sinhvien', 'giaovien') NOT NULL,
    hoTen VARCHAR(100),
    email VARCHAR(100),
    lop VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đề thi
CREATE TABLE deThi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tieuDe VARCHAR(255),
    moTa TEXT,
    ngayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    idGiaoVien INT,
    FOREIGN KEY (idGiaoVien) REFERENCES users(id)
);

-- Bảng câu hỏi trong đề thi
CREATE TABLE cauHoi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDeThi INT,
    noiDung TEXT,
    dapAnA VARCHAR(255),
    dapAnB VARCHAR(255),
    dapAnC VARCHAR(255),
    dapAnD VARCHAR(255),
    dapAnDung CHAR(1),
    FOREIGN KEY (idDeThi) REFERENCES deThi(id)
);

-- Bảng điểm
CREATE TABLE diem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idSinhVien INT,
    idDeThi INT,
    diem FLOAT,
    ngayLam DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idSinhVien) REFERENCES users(id),
    FOREIGN KEY (idDeThi) REFERENCES deThi(id)
);
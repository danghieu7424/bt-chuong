require("dotenv").config();
require("module-alias/register");
const express = require("express");
const favicon = require("serve-favicon");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

// ====================
// Khai báo app
// ====================

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cookieParser());
app.use(express.json());
// app.use(cors({}));
app.use(
  cors({
    origin: ["http://localhost:8080"], // đúng port React bạn đang dùng
    credentials: true,
  })
);

// Import các routers
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const adminRoutes = require('./routes/admin');

// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin', adminRoutes);

// Route cơ bản
app.get('/', (req, res) => {
  res.send('Chào mừng đến với API Hệ thống Quản lý Thi!');
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã có lỗi xảy ra trên server' });
});


// ====================
// Khởi động server
// ====================
app.listen(PORT, () => {
  console.log(`Video server running at http://localhost:${PORT}`);
});

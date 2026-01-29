const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// Register new user
const register = async (userData) => {
  const { name, email, password, studentId, faculty, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Check if studentId already exists
  if (studentId) {
    const existingStudentId = await User.findOne({ studentId });
    if (existingStudentId) {
      throw new Error("Mã sinh viên đã được sử dụng");
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    studentId,
    faculty,
    phone,
  });

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      faculty: user.faculty,
      role: user.role,
    },
    token,
  };
};

// Login user
const login = async (email, password) => {
  // Check if email and password provided
  if (!email || !password) {
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  // Find user with password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Tài khoản đã bị vô hiệu hóa");
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      faculty: user.faculty,
      role: user.role,
    },
    token,
  };
};

// Get current user profile
const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  return user;
};

module.exports = {
  register,
  login,
  getMe,
};

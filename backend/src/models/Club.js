const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên CLB"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả CLB"],
    },
    logo: {
      type: String,
      default: null,
    },
    faculty: {
      type: String,
      required: [true, "Vui lòng chọn khoa"],
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    facebook: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Club", clubSchema);

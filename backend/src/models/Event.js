const mongoose = require("mongoose");
const { EVENT_STATUS } = require("../utils/constants");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Vui lòng nhập tên sự kiện"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả"],
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Vui lòng chọn CLB tổ chức"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: [true, "Vui lòng nhập địa điểm"],
    },
    startDate: {
      type: Date,
      required: [true, "Vui lòng chọn thời gian bắt đầu"],
    },
    endDate: {
      type: Date,
      required: [true, "Vui lòng chọn thời gian kết thúc"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Vui lòng chọn hạn đăng ký"],
    },
    maxSlots: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng tối đa"],
      min: 1,
    },
    availableSlots: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.UPCOMING,
    },
    image: {
      type: String,
      default: null,
    },
    faculty: {
      type: String,
      default: null, // null = open for all faculties
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

// Initialize availableSlots with maxSlots
eventSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableSlots = this.maxSlots;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);

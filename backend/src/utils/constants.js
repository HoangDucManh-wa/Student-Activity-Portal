// User roles
const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  CLUB_ADMIN: "club_admin",
};

// Event status
const EVENT_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Registration status
const REGISTRATION_STATUS = {
  REGISTERED: "registered",
  ATTENDED: "attended",
  CANCELLED: "cancelled",
};

// Faculty list (example - adjust to your university)
const FACULTIES = [
  "Công nghệ thông tin",
  "Kinh tế",
  "Ngoại ngữ",
  "Sư phạm",
  "Khoa học tự nhiên",
  "Kỹ thuật",
];

module.exports = {
  USER_ROLES,
  EVENT_STATUS,
  REGISTRATION_STATUS,
  FACULTIES,
};

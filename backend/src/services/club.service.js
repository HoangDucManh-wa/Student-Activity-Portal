const Club = require("../models/Club");

// Create new club
const createClub = async (clubData) => {
  const { name, description, faculty, logo, email, facebook } = clubData;

  const club = await Club.create({
    name,
    description,
    faculty,
    logo,
    email,
    facebook,
  });

  return club;
};

// Get all clubs
const getClubs = async (filters = {}) => {
  const { faculty, search } = filters;

  const query = { isActive: true };

  if (faculty) query.faculty = faculty;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const clubs = await Club.find(query)
    .populate("admins", "name email")
    .sort({ name: 1 });

  return clubs;
};

// Get club by ID
const getClubById = async (clubId) => {
  const club = await Club.findById(clubId)
    .populate("admins", "name email studentId")
    .populate("members", "name email studentId");

  if (!club) {
    throw new Error("CLB không tồn tại");
  }

  return club;
};

// Update club
const updateClub = async (clubId, updateData) => {
  const club = await Club.findByIdAndUpdate(clubId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!club) {
    throw new Error("CLB không tồn tại");
  }

  return club;
};

// Add admin to club
const addAdmin = async (clubId, userId) => {
  const club = await Club.findById(clubId);

  if (!club) {
    throw new Error("CLB không tồn tại");
  }

  if (club.admins.includes(userId)) {
    throw new Error("Người dùng đã là admin");
  }

  club.admins.push(userId);
  await club.save();

  return club;
};

module.exports = {
  createClub,
  getClubs,
  getClubById,
  updateClub,
  addAdmin,
};

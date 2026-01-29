const Event = require("../models/Event");
const Club = require("../models/Club");

// Create new event
const createEvent = async (eventData, userId) => {
  const {
    title,
    description,
    club,
    location,
    startDate,
    endDate,
    registrationDeadline,
    maxSlots,
    faculty,
    image,
  } = eventData;

  // Verify club exists
  const clubExists = await Club.findById(club);
  if (!clubExists) {
    throw new Error("CLB không tồn tại");
  }

  // Create event
  const event = await Event.create({
    title,
    description,
    club,
    organizer: userId,
    location,
    startDate,
    endDate,
    registrationDeadline,
    maxSlots,
    availableSlots: maxSlots,
    faculty,
    image,
  });

  return await event.populate("club organizer", "name email");
};

// Get all events with filters
const getEvents = async (filters = {}) => {
  const { faculty, club, status, search, page = 1, limit = 10 } = filters;

  const query = { isActive: true };

  // Apply filters
  if (faculty) query.faculty = faculty;
  if (club) query.club = club;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  const events = await Event.find(query)
    .populate("club", "name logo")
    .populate("organizer", "name email")
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Event.countDocuments(query);

  return {
    events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get single event by ID
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("club", "name logo description")
    .populate("organizer", "name email");

  if (!event) {
    throw new Error("Sự kiện không tồn tại");
  }

  return event;
};

// Update event
const updateEvent = async (eventId, updateData) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Sự kiện không tồn tại");
  }

  // Don't allow changing maxSlots if registrations exist
  if (
    updateData.maxSlots &&
    updateData.maxSlots < event.maxSlots - event.availableSlots
  ) {
    throw new Error("Không thể giảm số lượng chỗ khi đã có người đăng ký");
  }

  // If maxSlots increased, update availableSlots
  if (updateData.maxSlots && updateData.maxSlots > event.maxSlots) {
    const difference = updateData.maxSlots - event.maxSlots;
    updateData.availableSlots = event.availableSlots + difference;
  }

  Object.assign(event, updateData);
  await event.save();

  return event;
};

// Delete event
const deleteEvent = async (eventId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Sự kiện không tồn tại");
  }

  event.isActive = false;
  await event.save();

  return { message: "Xóa sự kiện thành công" };
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};

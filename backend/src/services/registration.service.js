const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const { sendEmail, emailTemplates } = require("../utils/mailer");
const { REGISTRATION_STATUS } = require("../utils/constants");

// Register for event
const registerForEvent = async (userId, eventId) => {
  // Check if event exists
  const event = await Event.findById(eventId).populate("club", "name");

  if (!event) {
    throw new Error("Sự kiện không tồn tại");
  }

  // Check if registration is still open
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new Error("Đã hết hạn đăng ký");
  }

  // Check if event has available slots
  if (event.availableSlots <= 0) {
    throw new Error("Sự kiện đã hết chỗ");
  }

  // Check if user already registered
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: { $ne: REGISTRATION_STATUS.CANCELLED },
  });

  if (existingRegistration) {
    throw new Error("Bạn đã đăng ký sự kiện này rồi");
  }

  // Create registration (using transaction to ensure atomicity)
  const session = await Registration.startSession();
  session.startTransaction();

  try {
    // Create registration
    const registration = await Registration.create(
      [
        {
          user: userId,
          event: eventId,
        },
      ],
      { session },
    );

    // Decrease available slots
    event.availableSlots -= 1;
    await event.save({ session });

    await session.commitTransaction();

    // Send confirmation email
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: "Xác nhận đăng ký sự kiện",
        html: emailTemplates.registrationConfirmation(user.name, event.title),
      });
    }

    return await registration[0].populate("event", "title startDate location");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Cancel registration
const cancelRegistration = async (userId, eventId) => {
  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: REGISTRATION_STATUS.REGISTERED,
  });

  if (!registration) {
    throw new Error("Không tìm thấy đăng ký");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Sự kiện không tồn tại");
  }

  // Use transaction
  const session = await Registration.startSession();
  session.startTransaction();

  try {
    // Update registration status
    registration.status = REGISTRATION_STATUS.CANCELLED;
    registration.cancelledAt = new Date();
    await registration.save({ session });

    // Increase available slots
    event.availableSlots += 1;
    await event.save({ session });

    await session.commitTransaction();

    // Send cancellation email
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: "Xác nhận hủy đăng ký",
        html: emailTemplates.cancellationNotice(user.name, event.title),
      });
    }

    return { message: "Hủy đăng ký thành công" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get user registrations
const getUserRegistrations = async (userId, filters = {}) => {
  const { status } = filters;

  const query = { user: userId };
  if (status) query.status = status;

  const registrations = await Registration.find(query)
    .populate({
      path: "event",
      populate: { path: "club", select: "name logo" },
    })
    .sort({ createdAt: -1 });

  return registrations;
};

// Get event registrations (for admin/organizer)
const getEventRegistrations = async (eventId) => {
  const registrations = await Registration.find({
    event: eventId,
    status: { $ne: REGISTRATION_STATUS.CANCELLED },
  })
    .populate("user", "name email studentId faculty phone")
    .sort({ createdAt: 1 });

  return registrations;
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  getEventRegistrations,
};

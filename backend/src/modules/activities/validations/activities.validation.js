// const Joi = require("joi");

// /**
//  * ==========================================
//  * Create Activity
//  * POST /activities
//  * ==========================================
//  */
// const createActivitySchema = Joi.object({
//   activityName: Joi.string().min(3).max(255).required(),

//   description: Joi.string().allow("", null),

//   coverImage: Joi.string().uri().allow("", null),

//   location: Joi.string().max(255).allow("", null),

//   activityType: Joi.string()
//     .valid("program", "competition", "recruitment")
//     .required(),

//   teamMode: Joi.string()
//     .valid("individual", "team", "both")
//     .default("individual"),

//   startTime: Joi.date().allow(null),

//   endTime: Joi.date().greater(Joi.ref("startTime")).allow(null),

//   registrationDeadline: Joi.date().less(Joi.ref("startTime")).allow(null),

//   minParticipants: Joi.number().integer().min(1).allow(null),

//   maxParticipants: Joi.number()
//     .integer()
//     .greater(Joi.ref("minParticipants"))
//     .allow(null),

//   prize: Joi.string().allow("", null),

//   organizationId: Joi.number().integer().positive().required(),

//   categoryId: Joi.number().integer().positive().required(),
// });

// /**
//  * ==========================================
//  * Update Activity
//  * PATCH /activities/:activityId
//  * ==========================================
//  */
// const updateActivitySchema = Joi.object({
//   activityName: Joi.string().min(3).max(255),

//   description: Joi.string().allow("", null),

//   coverImage: Joi.string().uri().allow("", null),

//   location: Joi.string().max(255).allow("", null),

//   activityType: Joi.string().valid("program", "competition", "recruitment"),

//   teamMode: Joi.string().valid("individual", "team", "both"),

//   startTime: Joi.date().allow(null),

//   endTime: Joi.date().greater(Joi.ref("startTime")).allow(null),

//   registrationDeadline: Joi.date().less(Joi.ref("startTime")).allow(null),

//   minParticipants: Joi.number().integer().min(1).allow(null),

//   maxParticipants: Joi.number()
//     .integer()
//     .greater(Joi.ref("minParticipants"))
//     .allow(null),

//   prize: Joi.string().allow("", null),

//   categoryId: Joi.number().integer().positive(),

//   activityStatus: Joi.string().valid(
//     "draft",
//     "published",
//     "running",
//     "finished",
//     "cancelled",
//   ),
// });

// module.exports = {
//   createActivitySchema,
//   updateActivitySchema,
// };

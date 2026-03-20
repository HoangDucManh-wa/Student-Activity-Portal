const service = require("./chat-sessions.service");
const { success } = require("../../utils/response");

const createSession = async (req, res, next) => {
  try {
    const result = await service.createSession(req.user.userId, req.body.title);
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
};

const getMySessions = async (req, res, next) => {
  try {
    const result = await service.getMySessions(req.user.userId, req.query);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const result = await service.getSessionById(req.params.id, req.user.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const addMessages = async (req, res, next) => {
  try {
    const result = await service.addMessages(
      req.params.id,
      req.user.userId,
      req.body.messages
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    const result = await service.deleteSession(req.params.id, req.user.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, getMySessions, getSessionById, addMessages, deleteSession };

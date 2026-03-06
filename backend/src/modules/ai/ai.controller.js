const aiService = require("./ai.service");
const { success } = require("../../utils/response");

const search = async (req, res, next) => {
  try {
    const { query, limit } = req.body;
    const result = await aiService.smartSearch(query, limit);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const recommend = async (req, res, next) => {
  try {
    const { limit } = req.body;
    const result = await aiService.getRecommendations(
      req.user.MaNguoiDung,
      limit
    );
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const ask = async (req, res, next) => {
  try {
    const { question } = req.body;
    const result = await aiService.askAboutActivities(question);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { search, recommend, ask };

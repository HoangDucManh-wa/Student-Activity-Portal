const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

const getGeminiClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY chưa được cấu hình");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const getModel = () => {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  return client.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiClient, getModel };

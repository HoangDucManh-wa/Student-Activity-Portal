const { Router } = require("express");
const controller = require("./ai.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const { searchSchema, recommendSchema, askSchema } = require("./ai.validation");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered search, recommendations, and Q&A (Google Gemini)
 */

router.use(protect);

/**
 * @swagger
 * /api/ai/search:
 *   post:
 *     summary: Semantic search across clubs and events using AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Search keywords or natural language query
 *                 example: music clubs with beginner-friendly activities
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 default: 10
 *                 description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: AI search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Ranked list of matching clubs or events
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         description: AI service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/search", validate(searchSchema), controller.search);

/**
 * @swagger
 * /api/ai/recommend:
 *   post:
 *     summary: Get personalized club and event recommendations for the current user
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 5
 *                 description: Maximum number of recommendations
 *     responses:
 *       200:
 *         description: Personalized recommendations based on user history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Recommended clubs and events
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         description: AI service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/recommend", validate(recommendSchema), controller.recommend);

/**
 * @swagger
 * /api/ai/ask:
 *   post:
 *     summary: Ask the AI assistant a question about the portal
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: A natural language question
 *                 example: How do I join a club as a new student?
 *     responses:
 *       200:
 *         description: AI-generated answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                       description: The AI's response to the question
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         description: AI service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/ask", validate(askSchema), controller.ask);

module.exports = router;

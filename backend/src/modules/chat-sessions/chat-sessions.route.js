const { Router } = require("express");
const controller = require("./chat-sessions.controller");
const { protect } = require("../../middlewares/auth.middleware");

const router = Router();

router.use(protect);

// POST /api/chat-sessions — create new session
router.post("/", controller.createSession);

// GET /api/chat-sessions — list my sessions
router.get("/", controller.getMySessions);

// GET /api/chat-sessions/:id — get session with messages
router.get("/:id", controller.getSessionById);

// POST /api/chat-sessions/:id/messages — save messages to session
router.post("/:id/messages", controller.addMessages);

// DELETE /api/chat-sessions/:id — soft delete session
router.delete("/:id", controller.deleteSession);

module.exports = router;

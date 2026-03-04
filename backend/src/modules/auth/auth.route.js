const { Router } = require("express");
const controller = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("./auth.validation");

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);

// Protected routes
router.get("/me", protect, controller.me);
router.post("/logout", protect, controller.logout);
router.put("/change-password", protect, validate(changePasswordSchema), controller.changePassword);

module.exports = router;

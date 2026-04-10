const { Router } = require("express");
const controller = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const { protect } = require("../../middlewares/auth.middleware");
const passport = require("../../config/passport");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordOrganizationSchema,
  resetPasswordOrganizationSchema,
  loginOrganizationSchema,
} = require("./auth.validation");

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/login/organization", validate(loginOrganizationSchema), controller.loginOrganization);
router.post("/refresh-token", validate(refreshTokenSchema), controller.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);
router.post("/verify-otp", validate(verifyOtpSchema), controller.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), controller.resendOtp);
router.post("/forgot-password/organization", validate(forgotPasswordOrganizationSchema), controller.forgotPasswordOrganization);
router.post("/reset-password/organization", validate(resetPasswordOrganizationSchema), controller.resetPasswordOrganization);

// Protected routes
router.get("/me", protect, controller.me);
router.post("/logout", protect, controller.logout);
router.put("/change-password", protect, validate(changePasswordSchema), controller.changePassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_failed`,
  }),
  controller.googleCallback
);
router.get("/google/exchange", controller.exchangeGoogleCode);

module.exports = router;

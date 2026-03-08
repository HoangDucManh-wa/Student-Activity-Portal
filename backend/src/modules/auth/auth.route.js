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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [TenNguoiDung, Email, MatKhau]
 *             properties:
 *               TenNguoiDung:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Full name
 *                 example: Nguyen Van A
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: nguyenvana@student.edu.vn
 *               MatKhau:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (min 6 characters)
 *                 example: secret123
 *               MaSV:
 *                 type: string
 *                 maxLength: 50
 *                 description: Student ID (optional)
 *                 example: SV001
 *               SDT:
 *                 type: string
 *                 maxLength: 20
 *                 description: Phone number (optional)
 *                 example: "0901234567"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/register", validate(registerSchema), controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Email, MatKhau]
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: nguyenvana@student.edu.vn
 *               MatKhau:
 *                 type: string
 *                 description: Account password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful — returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Account is locked or pending approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/login", validate(loginSchema), controller.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Issue a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: A valid refresh token obtained from login
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/refresh-token", controller.refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link via email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [Email]
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@student.edu.vn
 *     responses:
 *       200:
 *         description: Reset link sent to the email address (if account exists)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using a token received by email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, MatKhauMoi]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token from the email link
 *               MatKhauMoi:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: newSecret456
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", protect, controller.me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate the current access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/logout", protect, controller.logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password for the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MatKhauCu, MatKhauMoi]
 *             properties:
 *               MatKhauCu:
 *                 type: string
 *                 description: Current password
 *                 example: secret123
 *               MatKhauMoi:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: newSecret456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       400:
 *         description: Wrong current password or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put("/change-password", protect, validate(changePasswordSchema), controller.changePassword);

module.exports = router;

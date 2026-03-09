const { Router } = require("express");
const controller = require("./admin.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only statistics and system management endpoints
 */

router.use(protect);
router.use(authorize("ADMIN"));

/**
 * @swagger
 * /api/admin/stats/overview:
 *   get:
 *     summary: Get system-wide overview statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Returns aggregate counts for users, clubs, events, and registrations. Requires ADMIN role.
 *     responses:
 *       200:
 *         description: Overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OverviewStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/stats/overview", controller.getOverviewStats);

/**
 * @swagger
 * /api/admin/stats/activities:
 *   get:
 *     summary: Get activity and event statistics over time
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Returns monthly breakdown of event creation and registration counts. Requires ADMIN role.
 *     responses:
 *       200:
 *         description: Activity statistics by month
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
 *                   items:
 *                     $ref: '#/components/schemas/ActivityStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/stats/activities", controller.getActivityStats);

module.exports = router;

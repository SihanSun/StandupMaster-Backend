/**
 * @swagger
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       required:
 *       - name
 *       - weekdayTime
 *       properties:
 *         name:
 *           type: string
 *           example: Daily Standup
 *         description:
 *           type: string
 *           example: Share your updates and statues
 *         weekdayTime:
 *           type: array
 *           items: 
 *             type: string
 *             example: "Monday 09:00 - 09:30"
*/
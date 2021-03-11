const express = require('express');
const router = new express.Router();

/**
 * @openapi
 * tags:
 * - name: meeting-records
 *   description: Endpoints of meeting records resource
 */

/**
 * @openapi
 * /meeting-records/{team_id}:
 *   get:
 *     tags:
 *     - meeting-records
 *     summary: Get all meeting records by team id
 *     parameters:
 *     - name: team_id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MeetingRecord'
 *       401:
 *         description: Not authorized. Requester is not a member of the team
 *       404:
 *         description: Team doesn't exist
 */
router.get('/:teamId', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /meeting-records/{team_id}:
 *   post:
 *     tags:
 *       - meeting-records
 *     summary: Create a meeting record
 *     parameters:
 *     - name: team_id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingRecord'
 */
router.post('/:teamId', function(req, res) {
  res.status(501).send('Not Implemented');
});

module.exports = router;

import express from 'express';

const router = new express.Router();

/**
 * @openapi
 * tags:
 * - name: teams
 *   description: Endpoints of team resource
 */

/**
 * @openapi
 * /teams/{id}:
 *   get:
 *     tags:
 *     - teams
 *     summary: Get team by id
 *     parameters:
 *     - name: id
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
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Not authorized. Requester is not a member of the team
 *       404:
 *         description: Team doesn't exist
 */
router.get('/:id', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams:
 *   post:
 *     tags:
 *       - teams
 *     summary: Create a team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Successful operation. Team's owner will be the requester
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 */
router.post('/', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}:
 *   put:
 *     tags:
 *       - teams
 *     summary: Update team's info
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Not authorized. Requester the team's owner.
 *       404:
 *         description: Team doesn't exist
 */
router.post('/', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}/members:
 *   post:
 *     tags:
 *       - teams
 *     summary: Add a member to the team
 *     description: The team owner's can add other users to the team. Users can also add themselves to the team using
 *                  invitation code.Note that if the requester provides the code param, the requester is assumed to be
 *                  adding him/herself to a team. If the requester provides the email param, the requester is assumed
 *                  to be the team's owner and adding new member to the team. Only one of the param should be provided.
 *     parameters:
 *     - name: id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Bad request. Request data is invalid
 *       401:
 *         description: Not authorized. Requester is not authorized to add member to the team
 *       404:
 *         description: Team doesn't exist
 */
router.post('/:id/members', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}/announcement:
 *   put:
 *     tags:
 *       - teams
 *     summary: Update the team's announcement
 *     description: Only the team owner's can update the team's announcement.
 *     parameters:
 *     - name: id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               announcement:
 *                 type: string
 *                 example: "today's meeting is canceled"
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Bad request. Request data is invalid
 *       401:
 *         description: Not authorized. Requester is not authorized to add member to the team
 *       404:
 *         description: Team doesn't exist
 */
router.put('/:id/announcement', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}/meetings:
 *   post:
 *     tags:
 *       - teams
 *     summary: Register a new meeting to the team
 *     parameters:
 *     - name: id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meeting'
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       400:
 *         description: Bad request. Request data is invalid
 *       401:
 *         description: Not authorized. Requester is not authorized to add meeting to the team
 *       404:
 *         description: Team doesn't exist
 */
router.post('/:id/meetings', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}/meetings/{meeting_name}:
 *   delete:
 *     tags:
 *       - teams
 *     summary: Delete the specified meeting from the team
 *     parameters:
 *     - name: meeting_name
 *       in: path
 *       description: name of the meeting
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       401:
 *         description: Not authorized. Requester is not authorized to delete meeting from the team
 *       404:
 *         description: Meeting doesn't exist
 */
router.delete('/:id/meetings/:meetingName', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /teams/{id}:
 *   delete:
 *     tags:
 *       - teams
 *     summary: Delete the team specified by id
 *     parameters:
 *     - name: id
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
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Not authorized. Requester is not the team's owner
 *       404:
 *         description: Team doesn't exist
 */
router.delete('/:id', function(req, res) {
  res.status(501).send('Not Implemented');
});

export default router;


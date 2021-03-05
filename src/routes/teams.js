var express = require('express');
const router = express.Router();

/**
 * @openapi
 * tags:
 * - name: team
 *   description: Endpoints of team resource
 */

/**
 * @openapi
 * /teams/{id}:
 *   get:
 *     tags: 
 *     - team
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
router.get('/:id', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /teams:
 *   post:
 *     tags:
 *       - team
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
router.post('/', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /teams/{id}:
 *   put:
 *     tags:
 *       - team
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
 router.post('/', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /teams/{id}/members:
 *   post:
 *     tags:
 *       - team
 *     summary: Add a member to the team
 *     description: The team owner's can add other users to the team. Users can also add themselves to the team using invitation code.
 *                  Note that if the requester provides the code param, the requester is assumed to be adding him/herself to a team. If the
 *                  requester provides the email param, the requester is assumed to be the team's owner and adding new member to the team.
 *                  Only one of the param should be provided.
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
 router.post('/:id/members', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /teams/{id}/announcement:
 *   put:
 *     tags:
 *       - team
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
 router.put('/:id/announcement', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /teams/{id}:
 *   delete:
 *     tags:
 *       - team
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
 router.delete('/:id', function (req, res) {
  res.status(501).send('Not Implemented')
})

module.exports = router;
/*
 *     responses:
 *       200:
 *         description: "ok"
 *         schema:
 *           $ref: '#/components/schemas/Team'
*/
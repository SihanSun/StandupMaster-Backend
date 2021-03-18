import express from 'express';

const router = new express.Router();

/**
 * @openapi
 * tags:
 * - name: user-status
 *   description: Endpoints of user status resource
 */

/**
 * @openapi
 * /user-status/{email}:
 *   get:
 *     tags:
 *     - user-status
 *     summary: Get user status by user's email
 *     parameters:
 *     - name: email
 *       in: path
 *       description: email of user to return
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatus'
 *       401:
 *         description: Not authorized. Requester can't view this user status
 *       404:
 *         description: User doesn't exist
 */
router.get('/user-status/:email', function(req, res, next) {
  res.status(501).send('Not Implemented');
});


/**
 * @openapi
 * /user-status/{email}:
 *   put:
 *     tags:
 *     - user-status
 *     summary: Update user's status
 *     parameters:
 *      - name: email
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserStatus'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatus'
 *       401:
 *         description: Not authorized. Requester is not the user specified by the email
 *       404:
 *         description: User doesn't exist
 */
router.put('/user-status/:email', function(req, res) {
  res.status(501).send('Not Implemented');
});

export default router;

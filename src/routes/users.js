var express = require('express');
const router = express.Router()

/**
 * @openapi
 * tags:
 * - name: user
 *   description: Endpoints of user resource
 */

/**
 * @openapi
 * /users/{email}:
 *   get:
 *     tags:
 *     - user
 *     summary: Get user by id
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
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized. Requester can't view this user
 *       404:
 *         description: User doesn't exist
 */
router.get('/:email', function (req, res, next) {
  res.status(501).send('Not Implemented')
})


/**
 * @openapi
 * /users/{email}:
 *   put:
 *     tags:
 *     - user
 *     summary: Update user's info
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized. Requester is not the user specified by that email
 *       404:
 *         description: User doesn't exist
 */
router.put('/:email', function (req, res) {
  res.status(501).send('Not Implemented')
})

/**
 * @openapi
 * /users/{email}/blocked:
 *   put:
 *     tags:
 *     - user
 *     summary: Update user's block status
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
 *             type: object
 *             properties:
 *               blocked:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized. Requester is not the user specified by that email
 *       404:
 *         description: User doesn't exist
 */
 router.put('/:email/blocked', function (req, res) {
  res.status(501).send('Not Implemented')
})

module.exports = router;
import express from 'express';
import {body} from 'express-validator';
import {error} from '../utils/middlewares';
import UserModel from '../models/user';

const router = new express.Router();

/**
 * @openapi
 * tags:
 * - name: users
 *   description: Endpoints of user resource
 */

/**
 * @openapi
 * /users/{email}:
 *   get:
 *     tags:
 *     - users
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
router.get('/:email', function(req, res) {
  res.status(501).send('Not Implemented');
});

/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *     - users
 *     summary: Create a new user
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
 *       400:
 *         description: Bad request. Request data is invalid
 *       401:
 *         description: Not authorized. Requester can't view this user
 *       404:
 *         description: User doesn't exist
 */
router.post('/',
    body('email').isEmail(),
    body('displayName').exists(),
    error,
    async function(req, res) {
      try {
        const result = await UserModel.create(req.body);
        res.send(result);
      } catch (error) {
        res.status(400).send(error);
      }
    });

/**
 * @openapi
 * /users/{email}:
 *   put:
 *     tags:
 *     - users
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
 *         description: Not authorized. Requester is not the user specified by the email
 *       404:
 *         description: User doesn't exist
 */
router.put('/:email', function(req, res) {
  res.status(501).send('Not Implemented');
});

export default router;

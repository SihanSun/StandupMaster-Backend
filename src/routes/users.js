import express from 'express';
import {body} from 'express-validator';

import {error} from '../utils/middlewares';
import UserModel from '../models/user';
import UserStatus from '../models/userStatus';

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
router.get('/:email', async function(req, res) {
  const user = await UserModel.get(req.params.email);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send('User doesn\'t exist');
  }
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
 */
router.post('/',
    body('email').isEmail(),
    body('displayName').exists(),
    error,
    async function(req, res) {
      try {
        const user = await UserModel.create(req.body);

        const userStatus = {
          email: user.email,
          isBlocked: false,
          presentation: {
            prevWork: '',
            planToday: '',
          },
        };
        await UserStatus.create(userStatus);

        res.send(user);
      } catch (error) {
        res.status(400).send('User already exists');
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
router.put('/:email',
    body('displayName').exists(),
    error,
    async function(req, res) {
      const email = req.params.email;

      if (req.headers.authorization.email !== email) {
        res.status('401').send('Not authorized to update this user');
        return;
      }

      const user = await UserModel.get(email);
      if (user === undefined) {
        res.status('404').send('User doesn\'t exist');
        return;
      }

      const params = {...req.body};
      params.email = email;

      const result = await UserModel.update(params);
      res.send(result);
    });

export default router;

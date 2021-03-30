import express from 'express';
import {body} from 'express-validator';

import {error} from '../utils/middlewares';
import {checkTwoUsersInSameTeam} from '../utils/helpers';
import UserStatusModel from '../models/userStatus';

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
 */
router.get('/:email', async function(req, res, next) {
  if (!(await checkTwoUsersInSameTeam(req.headers.authorization.email, req.params.email))) {
    res.status(401).send('Not authorized to view this user');
    return;
  }

  const userStatus = await UserStatusModel.get(req.params.email);
  res.send(userStatus);
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
router.put('/:email',
    body('isBlocked').exists(),
    body('presentation').exists(),
    body('presentation').custom((value) => {
      const notValid = (str) => str === undefined || str === null;
      if (value && (notValid(value.prevWork) || notValid(value.planToday) || notValid(value.blockedBy))) {
        throw new Error('presentation doesn\'t conform to schema');
      }
      return true;
    }),
    error,
    async function(req, res) {
      const email = req.params.email;

      if (req.headers.authorization.email !== email) {
        res.status('401').send('Not authorized to update this user');
        return;
      }

      const userStatus = await UserStatusModel.get(email);
      if (userStatus === undefined) {
        res.status('404').send('User doesn\'t exist');
        return;
      }

      const params = {...req.body};
      params.email = email;

      const result = await UserStatusModel.update(params);
      res.send(result);
    });

export default router;

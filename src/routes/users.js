import express from 'express';
import {body} from 'express-validator';

import {error} from '../utils/middlewares';
import {
  checkTwoUsersInSameTeam,
  generateSignedUrlForProfilePicture,
  uploadProfilePicture,
} from '../utils/helpers';
import UserModel from '../models/user';
import UserStatus from '../models/userStatus';
import TeamModel from '../models/team';
import UserInTeamModel from '../models/userInTeam';

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
 *     summary: Get user by id. If the requestor is querying for him/herself, team info will be included in the result
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
 */
router.get('/:email', async function(req, res) {
  const requestorEmail = req.headers.authorization.email;
  const email = req.params.email;

  if (!(await checkTwoUsersInSameTeam(requestorEmail, email))) {
    res.status(401).send('Not authorized to view this user');
    return;
  }

  const user = await UserModel.get(req.params.email);

  // only return team info if requestor is querying for him/herself
  if (email === requestorEmail) {
    const userInTeam = await UserInTeamModel.get(email);
    if (userInTeam !== undefined) {
      user.teamId = userInTeam.teamId;
      user.pendingToJoinTeam = userInTeam.pending;
    }
  }

  user.profilePictureUrl = await generateSignedUrlForProfilePicture(email);

  res.send(user);
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

      if (params.profilePicture !== undefined) {
        await uploadProfilePicture(email, params.profilePicture);
        delete params.profilePicture;
      }

      const result = await UserModel.update(params);
      res.send(result);
    });

export default router;

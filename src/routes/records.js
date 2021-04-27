import express from 'express';
import {body} from 'express-validator';
import {error} from '../utils/middlewares';

import TeamModel from '../models/team';
import MeetingRecordModel from '../models/meetingRecord';
import UserStatusModel from '../models/userStatus';


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
 *                 $ref: '#/components/schemas/UserStatus'
 *       401:
 *         description: Not authorized. Requester is not a member of the team
 *       404:
 *         description: Team doesn't exist
 */
router.get('/:teamId', async function(req, res) {
  const team = await TeamModel.get(req.params.teamId);
  if (!team) {
    res.status(404).send('Team doesn\'t exist');
    return;
  }

  if (!team.memberEmails.includes(req.headers.authorization.email)) {
    res.status(401).send('Not authorized to view this team');
    return;
  }

  let records = await MeetingRecordModel.query({'teamId': {'eq': req.params.teamId}}).exec();
  records = await records.toJSON();

  res.send(records);
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateTime:
 *                 type: string
t *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingRecord'
 */
router.post('/:teamId',
    body('dateTime').exists(),
    error,
    async function(req, res) {
      const dateTime = req.body.dateTime;
      const team = await TeamModel.get(req.params.teamId);

      if (!team) {
        res.status(404).send('Team doesn\'t exist');
        return;
      }

      if (team.ownerEmail !== req.headers.authorization.email) {
        res.status(401).send('Not authorized to get team');
        return;
      }

      const statuses = await (await UserStatusModel.batchGet(team.memberEmails)).toJSON();

      const payload = {
        teamId: team.id,
        dateTime: dateTime,
        userStatuses: statuses,
      };

      try {
        const record = await MeetingRecordModel.create(payload);
        res.send(record);
      } catch (error) {
        res.status(400).send('Record already exists');
        return;
      }
    });

export default router;

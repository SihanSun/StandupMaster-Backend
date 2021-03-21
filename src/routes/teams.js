import express from 'express';
import TeamModel from '../models/team';
import UserModel from '../models/user';

import {body} from 'express-validator';
import {error} from '../utils/middlewares';

import uuid from 'uuid';

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
router.get('/:id', async function(req, res) {
  const team = await TeamModel.get(req.params.id);
  if (!team) {
    res.status(404).send('Team doesn\'t exist');
    return;
  }

  if (!team.memberEmails || !team.memberEmails.includes(req.headers.authorization.email)) {
    res.status('401').send('Not authorized to get team');
    return;
  }

  const members = await UserModel.batchGet(team.memberEmails);
  team.members = members;
  team.owner = members.filter((e) => e.email === team.ownerEmail).pop();
  team.memberEmails = undefined;
  team.ownerEmail = undefined;
  res.send(team);
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
router.post('/',
    body('name').exists(),
    body('ownerEmail').exists(),
    error,
    async function(req, res) {
      if (req.headers.authorization.email !== req.body.ownerEmail) {
        res.status('401').send('Not authorized to create team');
        return;
      }

      const uid = uuid.v4();
      req.body.id = uid;
      req.body.memberEmails = [];
      req.body.memberEmails.push(req.body.ownerEmail);
      req.body.meetings = [];

      try {
        const team = await TeamModel.create(req.body);
        res.send(team);
      } catch (error) {
        res.status(400).send('Team already exists');
      }
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
router.put('/:id',
    body('name').exists(),
    body('ownerEmail').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      if (req.headers.authorization.email !== req.body.ownerEmail) {
        res.status('401').send('Not authorized to update this team');
        return;
      }

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      // TODO change owner not supported yet
      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized to update this team');
        return;
      }

      const params = req.body;
      params.id = id;

      const result = await TeamModel.update(params);
      res.send(result);
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
router.post('/:id/members',
    // body('code').exists(),
    body('email').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      const {code, email} = req.body;
      const user = await UserModel.get(email);
      if (user === undefined) {
        res.status('400').send('User doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized add member to this team');
        return;
      }

      // TODO invite code auth

      if (team.memberEmails.includes(email)) {
        res.status('400').send('User already is a member');
        return;
      }

      team.memberEmails.push(email);
      const result = await TeamModel.update(team);
      res.send(result);
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
router.put('/:id/announcement',
    body('announcement').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      // change owner not supported yet
      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized to update this team');
        return;
      }

      team.announcement = req.body.announcement;

      const result = await TeamModel.update(team);
      res.send(result);
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
router.post('/:id/meetings',
    body('name').exists(),
    body('weekdayTime').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized add meeting to this team');
        return;
      }

      const meeting = {...req.body};

      if (team.meetings.filter((e)=>e.name === meeting.name).length!=0) {
        res.status('400').send('Meeting name already exists');
        return;
      }

      team.meetings.push(meeting);
      const result = await TeamModel.update(team);
      res.send(result);
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
router.delete('/:id/meetings/:meetingName',
    async function(req, res) {
      const {id, meetingName} = req.params;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized delete meeting from this team');
        return;
      }

      const newMeetings = team.meetings.filter((e) => e.name != meetingName);
      if (newMeetings.length == team.meetings.length) {
        res.status('404').send('Meeting doesn\'t exist');
        return;
      }

      team.meetings = newMeetings;
      const result = await TeamModel.update(team);
      res.send(result);
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
router.delete('/:id',
    async function(req, res) {
      const {id} = req.params;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized delete this team');
        return;
      }

      const result = await TeamModel.delete(id);
      res.send(result);
    });

export default router;


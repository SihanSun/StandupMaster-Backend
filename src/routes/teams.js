import express from 'express';
import uuid from 'uuid';
import {body} from 'express-validator';

import TeamModel from '../models/team';
import UserModel from '../models/user';
import {generateSignedUrlForProfilePicture} from '../utils/helpers';
import {error} from '../utils/middlewares';

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

  team.pendingMembers = [];
  if (team.pendingMemberEmails.length>0) {
    const pendingMembers = await UserModel.batchGet(team.pendingMemberEmails);
    team.pendingMembers = pendingMembers;
  }

  const promises = [];
  for (const member of team.members) {
    const promise = generateSignedUrlForProfilePicture(member.email).then((url) => member.profilePictureUrl = url);
    promises.push(promise);
  }
  await Promise.all(promises);

  team.owner = members.filter((e) => e.email === team.ownerEmail).pop();
  team.memberEmails = undefined;
  team.pendingMemberEmails = undefined;
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
      req.body.pendingMemberEmails = [];
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

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized to update this team');
        return;
      }

      if (req.headers.authorization.email !== req.body.ownerEmail) {
        res.status('401').send('Changing owner not supported');
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
 *     description: The team owner's can add other users to the team directly or
 *                  by confirming the pending request.
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
    body('email').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      const {email} = req.body;
      const user = await UserModel.get(email);
      if (user === undefined) {
        res.status('400').send('User doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized add member to this team');
        return;
      }

      if (team.memberEmails.includes(email)) {
        res.status('400').send('User already is a member');
        return;
      }

      team.memberEmails.push(email);

      // comfirm pending join request
      const i = team.pendingMemberEmails.indexOf(email);
      if (i!=-1) {
        team.pendingMemberEmails.splice(i, 1);
      }

      const result = await TeamModel.update(team);
      res.send(result);
    });

/**
 * @openapi
 * /teams/{id}/members/:email:
 *   delete:
 *     tags:
 *       - teams
 *     summary: Remove member from the team
 *     description: Remove member from the team by owner
 *     parameters:
 *     - name: id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     - name: email
 *       in: path
 *       description: member's email
 *       required: true
 *       type: string
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
router.delete('/:id/members/:email',
    async function(req, res) {
      const {id, email} = req.params;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail) {
        res.status('401').send('Not authorized remove member from this team');
        return;
      }

      if (!team.memberEmails.includes(email)) {
        res.status('400').send('User is not a member');
        return;
      }

      const i = team.memberEmails.indexOf(email);
      team.memberEmails.splice(i, 1);

      const result = await TeamModel.update(team);
      res.send(result);
    });

/**
 * @openapi
 * /teams/{id}/pending_members:
 *   post:
 *     tags:
 *       - teams
 *     summary: Add a pending member from the team
 *     description: A user requests to join a team by add himself as a pending member.
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
router.post('/:id/pending_members',
    body('email').exists(),
    error,
    async function(req, res) {
      const id = req.params.id;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      const {email} = req.body;
      if (req.headers.authorization.email !== email) {
        res.status('401').send('Not authorized add pending member to this team');
        return;
      }

      const user = await UserModel.get(email);
      if (user === undefined) {
        res.status('400').send('User doesn\'t exist');
        return;
      }

      if (team.memberEmails.includes(email) || team.pendingMemberEmails.includes(email)) {
        res.status('400').send('User already is a member or a pending member');
        return;
      }

      team.pendingMemberEmails.push(email);

      // comfirm pending joining request
      const i = team.pendingMemberEmails.indexOf(email);
      if (i!=-1) {
        team.pendingMemberEmails.splice(i, 1);
      }

      const result = await TeamModel.update(team);
      res.send(result);
    });

/**
 * @openapi
 * /teams/{id}/pending_members/:email:
 *   delete:
 *     tags:
 *       - teams
 *     summary: Remove a pending member to the team
 *     description: Deny a user's request to join the team by owner or by the user.
 *     parameters:
 *     - name: id
 *       in: path
 *       description: team's id
 *       required: true
 *       type: string
 *     - name: email
 *       in: path
 *       description: member's email
 *       required: true
 *       type: string
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
router.delete('/:id/pending_members/:email',
    async function(req, res) {
      const {id, email} = req.params;

      const team = await TeamModel.get(id);
      if (team === undefined) {
        res.status('404').send('Team doesn\'t exist');
        return;
      }

      if (req.headers.authorization.email !== team.ownerEmail && req.headers.authorization.email !== email) {
        res.status('401').send('Not authorized remove pending member from this team');
        return;
      }

      if (!team.pendingMemberEmails.includes(email)) {
        res.status('400').send('User is not a pending member');
        return;
      }

      const i = team.pendingMemberEmails.indexOf(email);
      if (i!=-1) {
        team.pendingMemberEmails.splice(i, 1);
      }

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


import dynamoose from 'dynamoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *       - name
 *       - ownerEmail
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *         name:
 *           type: string
 *         owner:
 *           readOnly: true
 *           allOf:
 *           -  $ref: '#/components/schemas/User'
 *         ownerEmail:
 *           type: string
 *           writeOnly: true
 *         profilePictureUrl:
 *           type: string
 *           readOnly: true
 *         profilePicture:
 *           type: string
 *           format: binary
 *           writeOnly: true
 *         announcement:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           readOnly: True
 *         pendingMembers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           readOnly: True
 *         meetings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Meeting'
 *           readOnly: True
*/


const teamSchema = {
  id: {
    type: String,
    hashKey: true,
  },
  name: String,
  ownerEmail: String,
  profilePictureUrl: String,
  announcement: String,
  memberEmails: {
    type: Array,
    schema: [String],
  },
  pendingMemberEmails: {
    type: Array,
    schema: [String],
  },
  meetings: {
    type: Array,
    schema: [{
      type: Object,
      schema: {
        name: String,
        weekdayTime: {
          type: Array,
          schema: [String],
        },
        description: String,
      },
    }],
  },
};

const TeamModel = dynamoose.model('Team', teamSchema, {create: false});

export default TeamModel;

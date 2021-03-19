import dynamoose from 'dynamoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserStatus:
 *       type: object
 *       required:
 *       - email
 *       - isBlocked
 *       - presentation
 *       properties:
 *         email:
 *           type: string
 *           example: "richard.brown@yale.edu"
 *           readOnly: true
 *         isBlocked:
 *           type: boolean
 *         presentation:
 *           $ref: '#/components/schemas/Presentation'
 *     Presentation:
 *       type: object
 *       required:
 *       - prevWork
 *       - planToday
 *       properties:
 *         prevWork:
 *           type: string
 *         planToday:
 *           type: string
*/
const userStatusSchema = {
  email: {
    type: String,
    hashKey: true,
  },
  isBlocked: Boolean,
  presentation: {
    type: Object,
    schema: {
      prevWork: {
        type: String,
        required: true,
      },
      planToday: {
        type: String,
        required: true,
      },
    },
  },
};

const UserStatusModel = dynamoose.model('UserStatus', userStatusSchema, {create: false});

export default UserStatusModel;

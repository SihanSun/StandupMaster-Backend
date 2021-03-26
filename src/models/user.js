import dynamoose from 'dynamoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *       - email
 *       - displayName
 *       properties:
 *         email:
 *           type: string
 *           example: "richard.brown@yale.edu"
 *         profilePictureUrl:
 *           type: string
 *           readOnly: true
 *         profilePicture:
 *           type: string
 *           format: binary
 *           writeOnly: true
 *         displayName:
 *           type: string
 *           example: "chaiBot"
 *         firstName:
 *           type: string
 *           example: "Richard"
 *         lastName:
 *           type: string
 *           example: "Brown"
 *         team:
 *           $ref: '#/components/schemas/Team'
*/

const userSchema = {
  email: {
    type: String,
    hashKey: true,
  },
  displayName: String,
  profilePictureUrl: String,
  firstName: String,
  lastName: String,
};

const UserModel = dynamoose.model('User', userSchema, {create: false});

export default UserModel;

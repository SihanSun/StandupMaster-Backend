/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *       - email
 *       - profilePictureUrl
 *       - displayName
 *       - blocked
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
 *         blocked:
 *           type: boolean
 *           readOnly: true
*/

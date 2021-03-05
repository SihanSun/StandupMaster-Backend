/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *       - name
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *         name:
 *           type: string
 *         owner:
 *           type: string
 *           readOnly: true
 *         profilePictureUrl:
 *           type: string
 *           readOnly: true
 *         profilePicture:
 *           type: string
 *           format: binary
 *           writeOnly: true
 *         announcement:
 *            type: string
 *         members:
 *            type: array
 *            items: 
 *              $ref: '#/components/schemas/User'
 *            readOnly: True
*/
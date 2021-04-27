import dynamoose from 'dynamoose';

import {userStatusSchema} from './userStatus';

/**
 * @swagger
 * components:
 *   schemas:
 *     MeetingRecord:
 *       type: object
 *       properties:
 *         teamId:
 *           type: string
 *         dateTime:
 *           type: string
 *         meetingName:
 *           type: string
 *         userStatuses:
 *           type: array
 *           items:
 *             type: object
 *
*/
const MeetingRecordSchema = {
  teamId: {
    type: String,
    hashKey: true,
  },
  dateTime: {
    type: String,
    rangeKey: true,
  },
  userStatuses: {
    type: Array,
    schema: [{
      type: Object,
      schema: {
        ...userStatusSchema,
        email: String,
      },
    }],
  },
};

const MeetingRecordModel = dynamoose.model('MeetingRecord', MeetingRecordSchema, {create: false});

export default MeetingRecordModel;
